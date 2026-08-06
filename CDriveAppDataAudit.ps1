param([string]$OutputPath = (Join-Path $PSScriptRoot 'c-drive-audit\appdata-inventory.csv'))

$outputDirectory = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$source = @'
using System; using System.IO; using System.Collections.Generic;
public sealed class AppDataStat { public string Path; public long Bytes, Files, Dirs, Errors; }
public static class AppDataNativeAudit {
 public static AppDataStat Scan(string root) {
  var r=new AppDataStat{Path=root}; var q=new Stack<string>(); q.Push(root);
  while(q.Count>0) { var d=q.Pop(); r.Dirs++; try { foreach(var p in Directory.EnumerateFileSystemEntries(d)) { try {
   var a=File.GetAttributes(p); if((a&FileAttributes.ReparsePoint)!=0) continue;
   if((a&FileAttributes.Directory)!=0) {q.Push(p); continue;}
   var f=new FileInfo(p); r.Files++; r.Bytes+=f.Length;
  } catch {r.Errors++;} }} catch {r.Errors++;} }
  return r;
 }
}
'@
Add-Type -TypeDefinition $source -ErrorAction Stop

'scope,path,size_bytes,size_gb,file_count,directory_count,unreadable_entries' | Set-Content -LiteralPath $OutputPath -Encoding utf8
$base = 'C:\Users\Hakhoi\AppData'
foreach ($scope in @('Local', 'LocalLow', 'Roaming')) {
  $scopePath = Join-Path $base $scope
  if (-not (Test-Path -LiteralPath $scopePath)) { continue }
  Get-ChildItem -LiteralPath $scopePath -Force -Directory -ErrorAction SilentlyContinue |
    Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) } |
    ForEach-Object {
      $stat = [AppDataNativeAudit]::Scan($_.FullName)
      [pscustomobject]@{scope=$scope;path=$stat.Path;size_bytes=$stat.Bytes;size_gb=[math]::Round($stat.Bytes/1GB,3);file_count=$stat.Files;directory_count=$stat.Dirs;unreadable_entries=$stat.Errors} |
        Export-Csv -LiteralPath $OutputPath -NoTypeInformation -Append -Encoding utf8
    }
}

$personalRoots = @('Desktop','Documents','Downloads','Pictures','Videos') | ForEach-Object { Join-Path 'C:\Users\Hakhoi' $_ } | Where-Object { Test-Path -LiteralPath $_ }
$largeFiles = foreach ($root in $personalRoots) {
  Get-ChildItem -LiteralPath $root -Force -File -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -ge 100MB } |
    Select-Object @{n='path';e={$_.FullName}}, @{n='size_bytes';e={$_.Length}}, @{n='size_gb';e={[math]::Round($_.Length/1GB,3)}}, LastWriteTime
}
$largeFiles | Sort-Object size_bytes -Descending | Export-Csv -LiteralPath (Join-Path $outputDirectory 'personal-files-over-100mb.csv') -NoTypeInformation -Encoding utf8
