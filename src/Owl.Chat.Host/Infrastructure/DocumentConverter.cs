using System.Text;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Drawing;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Owl.Chat.Host.Infrastructure;
using Owl.Chat.Host.Options;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using IOPath = System.IO.Path;
using Text = DocumentFormat.OpenXml.Wordprocessing.Text;
using WordParagraph = DocumentFormat.OpenXml.Wordprocessing.Paragraph;

#pragma warning disable SKEXP0001

namespace DocumentConverter
{
    public class DocumentToMarkdown(
        ChatOptions chatOptions,
        string imageOutputPath = null,
        bool useBase64 = false)
    {
        private string _imageOutputPath = imageOutputPath;

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
                    if (_imageOutputPath != null || useBase64)
                    {
                        ExtractImages(page, markdown);
                    }
                }
            }

            return markdown.ToString();
        }

        /// <summary>
        /// 将PDF文件转换为Markdown格式
        /// </summary>
        /// <param name="pdfPath"></param>
        /// <param name="chatHistory"></param>
        /// <returns></returns>
        /// <summary>
        /// Extracts images from the page and returns a list of image data
        /// </summary>
        private List<(byte[] ImageData, string FileName, string MimeType)> ExtractImagesData(Page page)
        {
            var result = new List<(byte[] ImageData, string FileName, string MimeType)>();
            var images = page.GetImages();

            foreach (var image in images)
            {
                string filename = IOPath.GetRandomFileName();
                filename = IOPath.ChangeExtension(filename, ".png");
                byte[] bytes = image.RawBytes.ToArray();

                // Determine MIME type based on image data
                string mimeType = "image/png"; // Default
                if (bytes.Length > 2 && bytes[0] == 0xFF && bytes[1] == 0xD8)
                {
                    mimeType = "image/jpeg";
                }

                // Save file if not using base64
                if (!useBase64 && !string.IsNullOrEmpty(_imageOutputPath))
                {
                    Directory.CreateDirectory(_imageOutputPath);
                    string imagePath = IOPath.Combine(_imageOutputPath, filename);
                    File.WriteAllBytes(imagePath, bytes);
                    filename = chatOptions.App + "/images/" + filename;
                }

                result.Add((bytes, filename, mimeType));
            }

            return result;
        }

        /// <summary>
        /// 将PDF文件转换为Markdown格式并添加到聊天历史
        /// </summary>
        public ChatMessageContentItemCollection ConvertPdfToMarkdown(Stream stream, ref int requestToken,
            string docFileName)
        {
            StringBuilder textContent = new StringBuilder();
            List<(byte[] ImageData, string FileName, string MimeType)> allImages = new();

            var chatMessageContentItemCollection = new ChatMessageContentItemCollection();

            using (PdfDocument document = PdfDocument.Open(stream))
            {
                foreach (var page in document.GetPages())
                {
                    // 提取文本
                    string pageText = ExtractText(page);
                    pageText = ProcessHeadings(pageText);
                    pageText = ProcessLists(pageText);
                    pageText = ProcessParagraphs(pageText);
                    textContent.Append(pageText);

                    // 提取图片
                    if (_imageOutputPath != null || useBase64)
                    {
                        var pageImages = ExtractImagesData(page);
                        allImages.AddRange(pageImages);
                        foreach (var image in pageImages)
                        {
                            textContent.Append("![image](" + image.FileName + ")\n");
                        }
                    }
                }
            }

            // 首先添加文本内容
            if (textContent.Length > 0)
            {
                var text = new TextContent()
                {
                    Text = $@"
```markdown {docFileName}
{textContent}
```
"
                };
                requestToken += TokenHelper.GetTokens(text.Text);
                chatMessageContentItemCollection.Add(text);
            }


            return chatMessageContentItemCollection;
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

                if (useBase64)
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
                    markdown.AppendLine($"![image]({chatOptions.App + "/images/" + filename})\n");
                }
            }
        }


        public ChatMessageContentItemCollection ConvertWordToMarkdown(Stream stream, ref int requestToken, string wordFileName)
        {
            var chatMessageContentItemCollection = new ChatMessageContentItemCollection();

            StringBuilder markdown = new StringBuilder();

            using (WordprocessingDocument doc = WordprocessingDocument.Open(stream, false))
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
                                var blip = drawing.Descendants<Blip>().FirstOrDefault();
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

            var md = markdown.ToString();

            requestToken += TokenHelper.GetTokens(md);
            // 首先添加文本内容
            if (md.Length > 0)
            {
                var text = new TextContent()
                {
                    Text = $@"
```markdown {wordFileName}
{md}
```
"
                };
                requestToken += TokenHelper.GetTokens(text.Text);
                chatMessageContentItemCollection.Add(text);
            }

            return chatMessageContentItemCollection;
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

            if (useBase64)
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