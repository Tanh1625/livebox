Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-DocxText {
    param($Path)
    $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
    $entry = $zip.GetEntry('word/document.xml')
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xmlStr = $reader.ReadToEnd()
    $reader.Close()
    $zip.Dispose()
    
    $xml = [xml]$xmlStr
    $nsmgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $nsmgr.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
    
    $paragraphs = $xml.SelectNodes("//w:p", $nsmgr)
    foreach ($p in $paragraphs) {
        $texts = $p.SelectNodes(".//w:t", $nsmgr)
        $pText = ""
        foreach ($t in $texts) {
            $pText += $t.InnerText
        }
        if ($pText.Trim() -ne '') {
            Write-Output $pText
        }
    }
}

Write-Output '--- AI Agent ---'
Get-DocxText 'd:\z8\ALSDLC\livebox\Document\01_Business\Personas\AI Agent for Software Development.docx'
Write-Output '--- Template ---'
Get-DocxText 'd:\z8\ALSDLC\livebox\Document\01_Business\Personas\agile_user_story_template.docx'
