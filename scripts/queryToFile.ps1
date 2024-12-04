$soqlQuery1 = "SELECT Id, Name FROM Account"
$soqlQuery2 = "SELECT PermissionSetGroupId,PermissionSetGroup.DeveloperName FROM PermissionSetGroupComponent WHERE PermissionSetId IN (SELECT PermissionSetId FROM PermissionSetAssignment WHERE Assignee.Username = 'naga.kolipakula@emeal.nttdata.com.gsdev')"

$outputDir = "C:\Users\EKOLIPN8F\dev\JLR\jlrfservices\scripts"
if (-Not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

$outputFile1 = "$outputDir\soql_results_query1.txt"
$outputFile2 = "$outputDir\soql_results_query2.txt"

sfdx force:data:soql:query -q "$soqlQuery1" -r csv > $outputFile1

sfdx force:data:soql:query -q "$soqlQuery2" -r csv > $outputFile2

Write-Output "First SOQL query results exported to $outputFile1"
Write-Output "Second SOQL query results exported to $outputFile2"