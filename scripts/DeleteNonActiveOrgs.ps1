$orgList = sfdx force:org:list --json | ConvertFrom-Json

$inactiveOrgs = $orgList.result.nonScratchOrgs | Where-Object { $_.connectedStatus -ne "Connected" }

foreach ($org in $inactiveOrgs) {
    Write-Output "Deleting org: $($org.alias)"
    
    if ($org.username -match "test-.*@example.com") {
        sfdx org delete scratch --target-org $org.alias --no-prompt
    } else {
        sfdx org delete sandbox --target-org $org.alias --no-prompt
    }
}