param(
  [ValidateRange(1, 2147483647)]
  [int] $Limit = 1,
  [switch] $All
)

$ErrorActionPreference = 'Stop'

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
  $nodeExecutable = $nodeCommand.Source
}
else {
  $bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (-not (Test-Path -LiteralPath $bundledNode)) {
    throw 'Node.js was not found in PATH or the Codex bundled runtime.'
  }
  $nodeExecutable = $bundledNode
}

if ($env:TENCENTCLOUD_SECRETID -or $env:TENCENTCLOUD_SECRETKEY) {
  throw 'Tencent Cloud credential variables are already set. Run this script in a clean terminal.'
}

function ConvertFrom-SecureInput {
  param([System.Security.SecureString] $Value)
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

$secretIdSecure = Read-Host -Prompt 'Enter the new SecretId (input is hidden)' -AsSecureString
$secretKeySecure = Read-Host -Prompt 'Enter the new SecretKey (input is hidden)' -AsSecureString

try {
  $env:TENCENTCLOUD_SECRETID = ConvertFrom-SecureInput $secretIdSecure
  $env:TENCENTCLOUD_SECRETKEY = ConvertFrom-SecureInput $secretKeySecure
  $uploader = Join-Path $PSScriptRoot 'upload-reference-library.mjs'
  if ($All) {
    & $nodeExecutable $uploader
  }
  else {
    & $nodeExecutable $uploader "--limit=$Limit"
  }
  if ($LASTEXITCODE -ne 0) {
    throw "Uploader exited with code $LASTEXITCODE."
  }
}
finally {
  Remove-Item Env:TENCENTCLOUD_SECRETID -ErrorAction SilentlyContinue
  Remove-Item Env:TENCENTCLOUD_SECRETKEY -ErrorAction SilentlyContinue
  $secretIdSecure.Dispose()
  $secretKeySecure.Dispose()
}
