$orgAlias = "myDevOrg"
$orgCheck = sfdx force:org:list --json | ConvertFrom-Json
$orgExists = $orgCheck.result.nonScratchOrgs | Where-Object { $_.alias -eq $orgAlias }

if ($null -eq $orgExists) {
    Write-Output "Org with alias $orgAlias is not authenticated. Authenticating now..."
    sfdx force:auth:web:login -a $orgAlias --instanceurl https://test.salesforce.com
} else {
    Write-Output "Org with alias $orgAlias is already authenticated."
}

Write-Output "Opening sandbox org with alias $orgAlias..."
sfdx force:org:open -u $orgAlias