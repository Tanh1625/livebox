Add-Type -AssemblyName System.IO.Compression.FileSystem
$p = 'd:\z8\ALSDLC\livebox\Document\02_Requirement\tanh\LiveBox_Report3_Software_Requirement_Specification.docx'
$temp = 'd:\z8\ALSDLC\livebox\temp_docx.docx'
Copy-Item -Path $p -Destination $temp -Force
$zip = [System.IO.Compression.ZipFile]::OpenRead($temp)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
$xml = $xml -replace '</w:p>', "`n" -replace '<[^>]+>', ''
$xml | Out-File docx_text.txt
Select-String -Path docx_text.txt -Pattern '1.3.2|UC-01|UC-o1' -Context 5,20
Remove-Item -Path $temp -Force
