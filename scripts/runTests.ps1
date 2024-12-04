$outputDir = "C:\Users\EKOLIPN8F\dev\JLR\nagajlr1\scripts" 
$outputFile = "$outputDir\TestResults.txt"

$testResult = sfdx force:apex:test:run --resultformat=json --output-dir $outputDir --wait 10

$testResultFile = "$outputDir\test-result.json"

if (Test-Path $testResultFile) {
    $testResultJson = Get-Content $testResultFile | ConvertFrom-Json

    $failedTests = $testResultJson.result.tests | Where-Object { $_.outcome -ne "Pass" }

    $resultContent = "Test Execution Results:`r`n"

    if ($failedTests.Count -eq 0) {
        $resultContent += "All tests passed successfully.`r`n"
    } else {
        foreach ($test in $failedTests) {
            $resultContent += "`r`nTest Class: $($test.ApexClass.Name)`r`n"
            $resultContent += "Outcome: $($test.Outcome)`r`n"
            $resultContent += "Error Message: $($test.Message)`r`n"
            $resultContent += "Stack Trace: $($test.StackTrace)`r`n"
            
            # If there is a debug log, add it as well
            if ($test.HasDebugLog) {
                $debugLog = sfdx force:apex:log:get --logid $test.LogId
                $resultContent += "Debug Log:`r`n$debugLog`r`n"
            }
        }
    }

    Set-Content -Path $outputFile -Value $resultContent

    Write-Host "Test results saved to $outputFile"
} else {
    Write-Host "Test result file not found: $testResultFile"
}