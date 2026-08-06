param(
  [string]$ReportDirectory = (Join-Path $PSScriptRoot 'c-drive-audit')
)

$ErrorActionPreference = 'Continue'
New-Item -ItemType Directory -Path $ReportDirectory -Force | Out-Null
$detailPath = Join-Path $ReportDirectory 'folder-inventory.csv'
$summaryPath = Join-Path $ReportDirectory 'summary.txt'
$appsPath = Join-Path $ReportDirectory 'installed-applications.csv'
$errorsPath = Join-Path $ReportDirectory 'access-errors.txt'
$null = New-Item -ItemType File -Path $errorsPath -Force

$source = @'
using System;
using System.IO;
using System.Collections.Generic;
using System.Globalization;

public sealed class FolderStat {
    public string Path; public long Bytes; public long Files; public long Dirs;
    public long SmallFiles; public long ZeroFiles; public long Errors;
    public DateTime Oldest = DateTime.MaxValue; public DateTime Newest = DateTime.MinValue;
}
public static class DriveAuditNative {
    public static FolderStat Scan(string root) {
        var r = new FolderStat { Path = root };
        var stack = new Stack<string>(); stack.Push(root);
        while (stack.Count > 0) {
            var d = stack.Pop(); r.Dirs++;
            try {
                foreach (var p in Directory.EnumerateFileSystemEntries(d)) {
                    try {
                        var a = File.GetAttributes(p);
                        if ((a & FileAttributes.ReparsePoint) != 0) continue;
                        if ((a & FileAttributes.Directory) != 0) { stack.Push(p); continue; }
                        var f = new FileInfo(p); r.Files++; r.Bytes += f.Length;
                        if (f.Length <= 1048576) r.SmallFiles++;
                        if (f.Length == 0) r.ZeroFiles++;
                        if (f.LastWriteTimeUtc < r.Oldest) r.Oldest = f.LastWriteTimeUtc;
                        if (f.LastWriteTimeUtc > r.Newest) r.Newest = f.LastWriteTimeUtc;
                    } catch { r.Errors++; }
                }
            } catch { r.Errors++; }
        }
        return r;
    }
}
'@
Add-Type -TypeDefinition $source -ErrorAction Stop

function Get-RealDirectories([string]$Path) {
  Get-ChildItem -LiteralPath $Path -Force -Directory -ErrorAction SilentlyContinue |
    Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) }
}

function Convert-Stat([FolderStat]$Stat, [string]$Group) {
  [pscustomobject]@{
    group = $Group
    path = $Stat.Path
    size_bytes = $Stat.Bytes
    size_gb = [math]::Round($Stat.Bytes / 1GB, 3)
    file_count = $Stat.Files
    directory_count = $Stat.Dirs
    small_files_le_1mb = $Stat.SmallFiles
    empty_files = $Stat.ZeroFiles
    unreadable_entries = $Stat.Errors
    oldest_write_utc = if ($Stat.Oldest -eq [datetime]::MaxValue) { '' } else { $Stat.Oldest.ToString('o') }
    newest_write_utc = if ($Stat.Newest -eq [datetime]::MinValue) { '' } else { $Stat.Newest.ToString('o') }
  }
}

'group,path,size_bytes,size_gb,file_count,directory_count,small_files_le_1mb,empty_files,unreadable_entries,oldest_write_utc,newest_write_utc' | Set-Content -LiteralPath $detailPath -Encoding utf8

$targets = @()
$specialRoots = @('Users', 'Program Files', 'Program Files (x86)', 'ProgramData', 'XboxGames')
$targets += Get-RealDirectories 'C:\' |
  Where-Object { $_.Name -notin $specialRoots } |
  ForEach-Object { [pscustomobject]@{ Group = 'C root'; Path = $_.FullName } }

if (Test-Path -LiteralPath 'C:\Users\Hakhoi') {
  $targets += Get-RealDirectories 'C:\Users\Hakhoi' |
    ForEach-Object { [pscustomobject]@{ Group = 'Hakhoi profile child'; Path = $_.FullName } }
}
Get-RealDirectories 'C:\Users' |
  Where-Object { $_.Name -notin @('Hakhoi', 'CodexSandboxOffline') } |
  ForEach-Object { [pscustomobject]@{ Group = 'Other user profile'; Path = $_.FullName } }
foreach ($base in @('C:\Program Files', 'C:\Program Files (x86)', 'C:\ProgramData', 'C:\XboxGames')) {
  if (Test-Path -LiteralPath $base) {
    $targets += Get-RealDirectories $base | ForEach-Object { [pscustomobject]@{ Group = (Split-Path $base -Leaf) + ' child'; Path = $_.FullName } }
  }
}

$seen = @{}
foreach ($target in $targets) {
  if ($seen.ContainsKey($target.Path)) { continue }
  $seen[$target.Path] = $true
  try {
    $stat = [DriveAuditNative]::Scan($target.Path)
    Convert-Stat $stat $target.Group | Export-Csv -LiteralPath $detailPath -NoTypeInformation -Append -Encoding utf8
    "$(Get-Date -Format o) COMPLETE $($target.Path) $([math]::Round($stat.Bytes/1GB,3)) GB" | Add-Content -LiteralPath $summaryPath -Encoding utf8
  } catch {
    "$(Get-Date -Format o) FAILED $($target.Path): $($_.Exception.Message)" | Add-Content -LiteralPath $errorsPath -Encoding utf8
  }
}

$appRows = @()
foreach ($registryPath in @(
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
)) {
  $appRows += Get-ItemProperty $registryPath -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName } |
    Select-Object @{n='name';e={$_.DisplayName}}, @{n='version';e={$_.DisplayVersion}}, @{n='publisher';e={$_.Publisher}}, @{n='install_date';e={$_.InstallDate}}, @{n='install_location';e={$_.InstallLocation}}, @{n='uninstall_command';e={$_.UninstallString}}
}
$appRows | Sort-Object name -Unique | Export-Csv -LiteralPath $appsPath -NoTypeInformation -Encoding utf8

$all = Import-Csv -LiteralPath $detailPath
$drive = Get-PSDrive -Name C
@(
  "C: used: $([math]::Round($drive.Used/1GB,2)) GB; free: $([math]::Round($drive.Free/1GB,2)) GB"
  "Completed folder rows: $($all.Count)"
  ''
  'Largest completed folders:'
  ($all | Sort-Object {[double]$_.size_gb} -Descending | Select-Object -First 100 | Format-Table group,path,size_gb,file_count,small_files_le_1mb,oldest_write_utc,newest_write_utc -AutoSize | Out-String)
) | Set-Content -LiteralPath $summaryPath -Encoding utf8
