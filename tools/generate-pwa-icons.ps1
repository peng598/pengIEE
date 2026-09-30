Add-Type -AssemblyName System.Drawing

$iconDirectory = Join-Path $PSScriptRoot '..\assets\pwa'
$accent = [System.Drawing.ColorTranslator]::FromHtml('#bf4d48')

foreach ($size in @(192, 512)) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new([System.Drawing.Drawing2D.FillMode]::Alternate)
  $scale = $size / 192.0
  $matrix = [System.Drawing.Drawing2D.Matrix]::new()

  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::White)
    $path.AddLine(47, 38, 107, 38)
    $path.AddBezier(107, 38, 138, 38, 156, 55, 156, 83)
    $path.AddBezier(156, 83, 156, 111, 138, 128, 107, 128)
    $path.AddLine(107, 128, 77, 128)
    $path.AddLine(77, 128, 77, 159)
    $path.AddLine(77, 159, 47, 159)
    $path.CloseFigure()

    $path.StartFigure()
    $path.AddLine(77, 63, 101, 63)
    $path.AddBezier(101, 63, 119, 63, 128, 70, 128, 83)
    $path.AddBezier(128, 83, 128, 96, 119, 103, 101, 103)
    $path.AddLine(101, 103, 77, 103)
    $path.CloseFigure()

    $matrix.Scale($scale, $scale)
    $path.Transform($matrix)
    $brush = [System.Drawing.SolidBrush]::new($accent)
    try {
      $graphics.FillPath($brush, $path)
    } finally {
      $brush.Dispose()
    }

    $outputPath = Join-Path $iconDirectory "icon-$size.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $matrix.Dispose()
    $path.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}
