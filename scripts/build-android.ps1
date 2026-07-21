$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$jdkCandidates = @(
    $env:JAVA_HOME,
    'C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot',
    'C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot'
) | Where-Object { $_ -and (Test-Path (Join-Path $_ 'bin\java.exe')) }

if ($jdkCandidates.Count -eq 0) {
    throw 'Khong tim thay JDK 21. Hay cai Microsoft OpenJDK 21 hoac dat JAVA_HOME.'
}

$sdkCandidates = @(
    $env:ANDROID_SDK_ROOT,
    $env:ANDROID_HOME,
    'D:\Android\Sdk',
    (Join-Path $env:LOCALAPPDATA 'Android\Sdk')
) | Where-Object { $_ -and (Test-Path $_) }

if ($sdkCandidates.Count -eq 0) {
    throw 'Khong tim thay Android SDK. Hay dat ANDROID_SDK_ROOT hoac ANDROID_HOME.'
}

$env:JAVA_HOME = $jdkCandidates[0]
$env:ANDROID_SDK_ROOT = $sdkCandidates[0]
$env:ANDROID_HOME = $sdkCandidates[0]
$env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$(Join-Path $env:ANDROID_SDK_ROOT 'platform-tools');$env:Path"

$publicDownloadDirectory = Join-Path $repoRoot 'public\downloads'
$publicDownloadPath = Join-Path $publicDownloadDirectory 'UStudy-android.apk'
$stashedPublicApk = Join-Path ([System.IO.Path]::GetTempPath()) "UStudy-android-$([Guid]::NewGuid().ToString('N')).apk"

Push-Location $repoRoot
try {
    # Prevent the previous downloadable APK from being embedded inside the next APK.
    if (Test-Path $publicDownloadPath) {
        Move-Item -LiteralPath $publicDownloadPath -Destination $stashedPublicApk
    }

    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Web build that bai.' }

    npx cap sync android
    if ($LASTEXITCODE -ne 0) { throw 'Capacitor sync that bai.' }

    Push-Location (Join-Path $repoRoot 'android')
    try {
        .\gradlew.bat :app:assembleDebug
        if ($LASTEXITCODE -ne 0) { throw 'Android build that bai.' }
    } finally {
        Pop-Location
    }

    $sourceApk = Join-Path $repoRoot 'android\app\build\outputs\apk\debug\UStudy-debug.apk'
    if (-not (Test-Path $sourceApk)) { throw "Khong tim thay APK tai $sourceApk" }

    $artifactDirectory = Join-Path $repoRoot 'artifacts'
    New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
    $artifactPath = Join-Path $artifactDirectory 'UStudy-debug.apk'
    Copy-Item -LiteralPath $sourceApk -Destination $artifactPath -Force

    New-Item -ItemType Directory -Path $publicDownloadDirectory -Force | Out-Null
    Copy-Item -LiteralPath $sourceApk -Destination $publicDownloadPath -Force

    Write-Host "APK: $artifactPath"
    Write-Host "Public download: $publicDownloadPath"
} finally {
    if (Test-Path $stashedPublicApk) {
        if (Test-Path $publicDownloadPath) {
            Remove-Item -LiteralPath $stashedPublicApk -Force
        } else {
            New-Item -ItemType Directory -Path $publicDownloadDirectory -Force | Out-Null
            Move-Item -LiteralPath $stashedPublicApk -Destination $publicDownloadPath
        }
    }
    Pop-Location
}
