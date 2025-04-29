$Hso = New-Object Net.HttpListener
$Hso.Prefixes.Add("http://localhost:8000/")
$Hso.Start()

Write-Host "Server started at http://localhost:8000/"
Write-Host "Press Ctrl+C to stop the server"

$mimeTypes = @{
    ".html" = "text/html"
    ".css" = "text/css"
    ".js" = "text/javascript"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".gif" = "image/gif"
}

try {
    while ($Hso.IsListening) {
        $HC = $Hso.GetContext()
        $HRes = $HC.Response
        $path = $HC.Request.Url.LocalPath
        
        if ($path -eq "/") {
            $path = "/index.html"
        }
        
        $localPath = Join-Path $PSScriptRoot $path.Substring(1)
        
        if (Test-Path $localPath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($localPath)
            $contentType = $mimeTypes[$extension]
            if (-not $contentType) {
                $contentType = "application/octet-stream"
            }
            
            $content = [System.IO.File]::ReadAllBytes($localPath)
            $HRes.ContentType = $contentType
            $HRes.ContentLength64 = $content.Length
            $HRes.OutputStream.Write($content, 0, $content.Length)
        } else {
            $HRes.StatusCode = 404
        }
        
        $HRes.Close()
    }
} finally {
    $Hso.Stop()
}
