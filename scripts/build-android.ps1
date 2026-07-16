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

Push-Location $repoRoot
try {
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

    $publicDownloadDirectory = Join-Path $repoRoot 'public\downloads'
    New-Item -ItemType Directory -Path $publicDownloadDirectory -Force | Out-Null
    $publicDownloadPath = Join-Path $publicDownloadDirectory 'UStudy-android.apk'
    Copy-Item -LiteralPath $sourceApk -Destination $publicDownloadPath -Force

    Write-Host "APK: $artifactPath"
    Write-Host "Public download: $publicDownloadPath"
} finally {
    Pop-Location
}
