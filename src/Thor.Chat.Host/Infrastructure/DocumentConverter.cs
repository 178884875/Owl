using System.Text;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using IOPath = System.IO.Path;
using WordParagraph = DocumentFormat.OpenXml.Wordprocessing.Paragraph;

namespace DocumentConverter
{
    public class DocumentToMarkdown
    {
        private string _imageOutputPath;
        private readonly bool _useBase64;

        public DocumentToMarkdown(string imageOutputPath = null, bool useBase64 = false)
        {
            _imageOutputPath = imageOutputPath;
            _useBase64 = useBase64;
        }

        public string ConvertPdfToMarkdown(Stream stream)
        {
            
            StringBuilder markdown = new StringBuilder();

            using (PdfDocument document = PdfDocument.Open(stream))
            {
                foreach (var page in document.GetPages())
                {
                    // 提取文本
                    string pageText = ExtractText(page);

                    // 处理文本格式
                    pageText = ProcessHeadings(pageText);
                    pageText = ProcessLists(pageText);
                    pageText = ProcessParagraphs(pageText);

                    markdown.Append(pageText);

                    // 处理图片
                    if (_imageOutputPath != null || _useBase64)
                    {
                        ExtractImages(page, markdown);
                    }
                }
            }

            return markdown.ToString();
        }

        public string ConvertPdfToMarkdown(string pdfPath)
        {
            StringBuilder markdown = new StringBuilder();

            using (PdfDocument document = PdfDocument.Open(pdfPath))
            {
                foreach (var page in document.GetPages())
                {
                    // 提取文本
                    string pageText = ExtractText(page);

                    // 处理文本格式
                    pageText = ProcessHeadings(pageText);
                    pageText = ProcessLists(pageText);
                    pageText = ProcessParagraphs(pageText);

                    markdown.Append(pageText);

                    // 处理图片
                    if (_imageOutputPath != null || _useBase64)
                    {
                        ExtractImages(page, markdown);
                    }
                }
            }

            return markdown.ToString();
        }

        private string ExtractText(Page page)
        {
            StringBuilder text = new StringBuilder();

            // 获取所有文本块
            var words = page.GetWords();
            var sortedWords = words.OrderBy(w => w.BoundingBox.Bottom)
                .ThenBy(w => w.BoundingBox.Left)
                .ToList();

            var currentLine = sortedWords.FirstOrDefault()?.BoundingBox.Bottom ?? 0;

            foreach (var word in sortedWords)
            {
                // 检查是否需要添加换行
                if (Math.Abs(word.BoundingBox.Bottom - currentLine) > 5f)
                {
                    text.AppendLine();
                    currentLine = word.BoundingBox.Bottom;
                }

                text.Append(word.Text + " ");
            }

            return text.ToString();
        }

        private void ExtractImages(Page page, StringBuilder markdown)
        {
            var images = page.GetImages();
            foreach (var image in images)
            {
                string filename = IOPath.GetRandomFileName();
                filename = IOPath.ChangeExtension(filename, ".png");

                if (_useBase64)
                {
                    byte[] bytes = image.RawBytes.ToArray();
                    string base64 = Convert.ToBase64String(bytes);
                    string mimeType = "image/png"; // 默认为PNG

                    // 根据图片数据判断格式
                    if (bytes.Length > 2 && bytes[0] == 0xFF && bytes[1] == 0xD8) // JPEG 文件头
                    {
                        mimeType = "image/jpeg";
                    }

                    markdown.AppendLine($"![image](data:{mimeType};base64,{base64})\n");
                }
                else
                {
                    if (string.IsNullOrEmpty(_imageOutputPath))
                    {
                        _imageOutputPath = "images";
                    }

                    Directory.CreateDirectory(_imageOutputPath);
                    string imagePath = IOPath.Combine(_imageOutputPath, filename);

                    File.WriteAllBytes(imagePath, image.RawBytes.ToArray());
                    markdown.AppendLine($"![image]({imagePath.Replace("\\", "/")})\n");
                }
            }
        }

        public string ConvertWordToMarkdown(string wordPath)
        {
            StringBuilder markdown = new StringBuilder();

            using (WordprocessingDocument doc = WordprocessingDocument.Open(wordPath, false))
            {
                var body = doc.MainDocumentPart.Document.Body;

                foreach (var para in body.Elements<WordParagraph>())
                {
                    // 获取段落文本
                    string text = string.Join("", para.Descendants<Text>().Select(t => t.Text));
                    if (string.IsNullOrEmpty(text)) continue;

                    // 处理样式
                    var style = para.ParagraphProperties?.ParagraphStyleId?.Val?.Value;
                    var numProp = para.ParagraphProperties?.NumberingProperties;

                    // 处理标题
                    if (style != null && style.StartsWith("Heading"))
                    {
                        int level = int.Parse(Regex.Match(style, @"\d+").Value);
                        markdown.AppendLine(new string('#', level) + " " + text);
                    }
                    // 处理列表
                    else if (numProp != null)
                    {
                        var numId = numProp.NumberingId?.Val;
                        var lvl = numProp.NumberingLevelReference?.Val;

                        if (numId != null)
                        {
                            var numbering = doc.MainDocumentPart.NumberingDefinitionsPart.Numbering;
                            var numDef = numbering
                                .Elements<NumberingInstance>()
                                .FirstOrDefault(n => n.NumberID == numId);

                            if (numDef != null)
                            {
                                bool isBullet = IsNumberingStyleBullet(numbering, numDef, lvl ?? 0);
                                string prefix = isBullet ? "* " : "1. ";
                                markdown.AppendLine(prefix + text);
                            }
                        }
                    }
                    else
                    {
                        // 处理段落中的图片
                        var drawings = para.Descendants<Drawing>();
                        if (drawings.Any())
                        {
                            foreach (var drawing in drawings)
                            {
                                var blip = drawing.Descendants<DocumentFormat.OpenXml.Drawing.Blip>().FirstOrDefault();
                                if (blip != null)
                                {
                                    var imageId = blip.Embed.Value;
                                    var imagePart = doc.MainDocumentPart.GetPartById(imageId) as ImagePart;
                                    if (imagePart != null)
                                    {
                                        string imageMarkdown = ProcessImage(imagePart);
                                        markdown.AppendLine(imageMarkdown);
                                    }
                                }
                            }
                        }

                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            markdown.AppendLine(text + "\n");
                        }
                    }
                }
            }

            return markdown.ToString();
        }

        private bool IsNumberingStyleBullet(Numbering numbering, NumberingInstance numInstance, int level)
        {
            var abstractNumId = numInstance.AbstractNumId.Val;
            var abstractNum = numbering
                .Elements<AbstractNum>()
                .FirstOrDefault(n => n.AbstractNumberId == abstractNumId);

            if (abstractNum != null)
            {
                var levelDef = abstractNum
                    .Elements<Level>()
                    .FirstOrDefault(l => l.LevelIndex == level);

                if (levelDef != null)
                {
                    var numFmt = levelDef.NumberingFormat?.Val;
                    return numFmt == "bullet";
                }
            }

            return false;
        }

        private string ProcessHeadings(string text)
        {
            var lines = text.Split('\n');
            for (int i = 0; i < lines.Length; i++)
            {
                if (IsLikelyHeading(lines[i]))
                {
                    lines[i] = "# " + lines[i];
                }
            }

            return string.Join("\n", lines);
        }

        private bool IsLikelyHeading(string line)
        {
            return !string.IsNullOrEmpty(line)
                   && line.Length < 100
                   && !line.EndsWith(".")
                   && char.IsUpper(line[0]);
        }

        private string ProcessLists(string text)
        {
            var lines = text.Split('\n');
            for (int i = 0; i < lines.Length; i++)
            {
                // 检测和转换项目符号列表
                if (Regex.IsMatch(lines[i], @"^[\u2022\u2023\u2043\u204C\u204D\u2219\u25AA\u25CF\u25E6\u2981\u2999]"))
                {
                    lines[i] = "* " + lines[i]
                        .TrimStart(
                            " \t\u2022\u2023\u2043\u204C\u204D\u2219\u25AA\u25CF\u25E6\u2981\u2999".ToCharArray());
                }
                // 检测和转换数字列表
                else if (Regex.IsMatch(lines[i], @"^\d+[\.\)]"))
                {
                    lines[i] = "1. " + Regex.Replace(lines[i], @"^\d+[\.\)]", "").Trim();
                }
            }

            return string.Join("\n", lines);
        }

        private string ProcessParagraphs(string text)
        {
            return Regex.Replace(text, @"([^\n])\n([^\n])", "$1\n\n$2");
        }

        private string ProcessImage(ImagePart imagePart)
        {
            string filename = IOPath.GetRandomFileName();
            string extension = imagePart.Uri.ToString().Split('.').Last();
            filename = IOPath.ChangeExtension(filename, extension);

            if (_useBase64)
            {
                using (Stream stream = imagePart.GetStream())
                using (MemoryStream ms = new MemoryStream())
                {
                    stream.CopyTo(ms);
                    byte[] imageBytes = ms.ToArray();
                    string base64 = Convert.ToBase64String(imageBytes);
                    string mimeType = GetMimeType(extension);
                    return $"![image](data:{mimeType};base64,{base64})\n";
                }
            }
            else
            {
                if (string.IsNullOrEmpty(_imageOutputPath))
                {
                    _imageOutputPath = "images";
                }

                Directory.CreateDirectory(_imageOutputPath);
                string imagePath = IOPath.Combine(_imageOutputPath, filename);

                using (Stream stream = imagePart.GetStream())
                using (FileStream fs = new FileStream(imagePath, FileMode.Create))
                {
                    stream.CopyTo(fs);
                }

                return $"![image]({imagePath.Replace("\\", "/")})\n";
            }
        }

        private string GetMimeType(string extension)
        {
            switch (extension.ToLower())
            {
                case "png": return "image/png";
                case "jpg":
                case "jpeg": return "image/jpeg";
                case "gif": return "image/gif";
                case "bmp": return "image/bmp";
                default: return "application/octet-stream";
            }
        }
    }
}