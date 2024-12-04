$homeDirectory = [System.Environment]::GetFolderPath("UserProfile")

$sfdxDirectory = Join-Path -Path $homeDirectory -ChildPath ".sfdx"

Write-Output "The .sfdx directory is located at: $sfdxDirectory"

if (Test-Path $sfdxDirectory) {
    Write-Output "The .sfdx directory exists."
} else {
    Write-Output "The .sfdx directory does not exist."
}