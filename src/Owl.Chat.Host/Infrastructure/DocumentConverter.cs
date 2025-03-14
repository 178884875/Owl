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
using Break = DocumentFormat.OpenXml.Wordprocessing.Break;
using IOPath = System.IO.Path;
using Table = DocumentFormat.OpenXml.Wordprocessing.Table;
using TableCell = DocumentFormat.OpenXml.Wordprocessing.TableCell;
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

        public ChatMessageContentItemCollection ConvertWordToMarkdown(Stream stream, ref int requestToken,
            string wordFileName)
        {
            var chatMessageContentItemCollection = new ChatMessageContentItemCollection();
            StringBuilder markdown = new StringBuilder();

            using (WordprocessingDocument doc = WordprocessingDocument.Open(stream, false))
            {
                var body = doc.MainDocumentPart?.Document.Body;

                // 处理文档内的表格样式引用
                IDictionary<string, TableStyle> tableStyles = new Dictionary<string, TableStyle>();
                if (doc.MainDocumentPart?.StyleDefinitionsPart != null)
                {
                    var stylesPart = doc.MainDocumentPart.StyleDefinitionsPart;
                    var styles = stylesPart.Styles;
                    foreach (var style in styles?.Elements<Style>().Where(s => s.Type == StyleValues.Table))
                    {
                        if (style.StyleId != null)
                        {
                            tableStyles[style.StyleId] = new TableStyle
                            {
                                StyleId = style?.StyleId.Value ?? "",
                                Name = style?.StyleName?.Val?.Value ?? ""
                            };
                        }
                    }
                }

                // 跟踪上下文状态
                bool inList = false;
                int currentListLevel = 0;
                bool inTable = false;
                string previousListId = null;
                int previousListLevel = -1;

                foreach (var element in body.ChildElements)
                {
                    if (element is WordParagraph para)
                    {
                        ProcessParagraph(para, doc, markdown, ref inList, ref currentListLevel, ref previousListId,
                            ref previousListLevel);
                    }
                    else if (element is Table table)
                    {
                        inList = false; // 结束之前的列表
                        ProcessTable(table, markdown);
                        inTable = true;
                    }
                    else if (element is SectionProperties)
                    {
                        
                    }
                }
            }

            var md = markdown.ToString();
            requestToken += TokenHelper.GetTokens(md);

            // 添加文本内容
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

        private void ProcessParagraph(WordParagraph para, WordprocessingDocument doc, StringBuilder markdown,
            ref bool inList, ref int currentListLevel, ref string previousListId, ref int previousListLevel)
        {
            // 获取段落样式
            var style = para.ParagraphProperties?.ParagraphStyleId?.Val?.Value;
            var numProp = para.ParagraphProperties?.NumberingProperties;

            // 检查段落是否为空
            if (!para.Descendants<Text>().Any() && !para.Descendants<Drawing>().Any() &&
                !para.Descendants<Break>().Any(b => b.Type == BreakValues.Page))
            {
                markdown.AppendLine();
                return;
            }

            // 处理分页符
            if (para.Descendants<Break>()
                .Any(b => b.Type == BreakValues.Page))
            {
                // markdown.AppendLine("\n<!-- 分页符 -->\n");
            }

            // 处理标题
            if (style != null && style.StartsWith("Heading"))
            {
                inList = false; // 结束之前的列表
                int level = int.Parse(Regex.Match(style, @"\d+").Value);
                string headingText = ProcessFormattedText(para);
                markdown.AppendLine(new string('#', level) + " " + headingText + "\n");
            }
            // 处理列表
            else if (numProp != null)
            {
                var numId = numProp.NumberingId?.Val;
                var lvl = numProp.NumberingLevelReference?.Val ?? 0;

                if (numId != null)
                {
                    var numbering = doc.MainDocumentPart.NumberingDefinitionsPart.Numbering;
                    var numDef = numbering
                        .Elements<NumberingInstance>()
                        .FirstOrDefault(n => n.NumberID == numId);

                    if (numDef != null)
                    {
                        bool isBullet = IsNumberingStyleBullet(numbering, numDef, lvl);

                        // 处理列表缩进和层级
                        if (!inList || numId.Value.ToString() != previousListId || lvl != previousListLevel)
                        {
                            // 如果不是延续之前的列表，先添加空行
                            if (inList && (numId.Value.ToString() != previousListId || lvl < previousListLevel))
                            {
                                markdown.AppendLine();
                            }

                            inList = true;
                            previousListId = numId.Value.ToString();
                            previousListLevel = lvl;
                            currentListLevel = lvl;
                        }

                        string indent = new string(' ', currentListLevel * 2);
                        string prefix = isBullet ? "* " : ($"{(lvl + 1)}. ");
                        string listItemText = ProcessFormattedText(para);
                        markdown.AppendLine(indent + prefix + listItemText);
                    }
                }
            }
            else
            {
                inList = false; // 结束之前的列表

                // 处理块引用（通常是缩进段落）
                int.TryParse(para.ParagraphProperties?.Indentation?.Left?.Value, out int indent);
                if (indent > 0)
                {
                    string blockText = ProcessFormattedText(para);
                    markdown.AppendLine("> " + blockText + "\n");
                }
                // 处理常规段落
                else
                {
                    string paragraphText = ProcessFormattedText(para);

                    // 检查段落中的图片
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

                    if (!string.IsNullOrWhiteSpace(paragraphText))
                    {
                        markdown.AppendLine(paragraphText + "\n");
                    }
                }
            }

            // 处理脚注和尾注
            var footnoteReferences = para.Descendants<FootnoteReference>();
            var endnoteReferences = para.Descendants<EndnoteReference>();

            if (footnoteReferences.Any() || endnoteReferences.Any())
            {
                // markdown.AppendLine("\n<!-- 文档包含脚注或尾注 -->\n");

                int footnoteCount = 1;
                foreach (var footnote in footnoteReferences)
                {
                    var footnoteId = footnote.Id.Value;
                    var footnotesPart = doc.MainDocumentPart.FootnotesPart;
                    if (footnotesPart != null)
                    {
                        var footnoteElement = footnotesPart.Footnotes.Elements<Footnote>()
                            .FirstOrDefault(f => f.Id.Value == footnoteId);

                        if (footnoteElement != null)
                        {
                            string footnoteText =
                                string.Join("", footnoteElement.Descendants<Text>().Select(t => t.Text));
                            markdown.AppendLine($"[^{footnoteCount}]: {footnoteText}");
                            footnoteCount++;
                        }
                    }
                }
            }
        }

        private string ProcessFormattedText(WordParagraph para)
        {
            StringBuilder textBuilder = new StringBuilder();

            foreach (var run in para.Elements<DocumentFormat.OpenXml.Wordprocessing.Run>())
            {
                string runText = string.Join("", run.Elements<Text>().Select(t => t.Text));

                if (string.IsNullOrEmpty(runText)) continue;

                // 检查文字格式
                var runProps = run.RunProperties;
                bool isBold = runProps?.Bold != null;
                bool isItalic = runProps?.Italic != null;
                bool isUnderline = runProps?.Underline != null;
                bool isStrike = runProps?.Strike != null;
                bool isHighlight = runProps?.Highlight != null;

                // 应用Markdown格式
                if (isBold) runText = $"**{runText}**";
                if (isItalic) runText = $"*{runText}*";
                if (isStrike) runText = $"~~{runText}~~";
                if (isUnderline) runText = $"<u>{runText}</u>"; // HTML标签，某些Markdown解析器支持

                // 检查超链接
                var hyperlink = run.Ancestors<DocumentFormat.OpenXml.Wordprocessing.Hyperlink>().FirstOrDefault();
                if (hyperlink != null)
                {
                    string relationshipId = hyperlink.Id?.Value;
                    if (!string.IsNullOrEmpty(relationshipId))
                    {
                        var mainPart = (run.Ancestors<Document>().FirstOrDefault()?.MainDocumentPart);
                        if (mainPart != null)
                        {
                            var relationship =
                                mainPart.HyperlinkRelationships.FirstOrDefault(r => r.Id == relationshipId);
                            if (relationship != null)
                            {
                                string url = relationship.Uri.ToString();
                                runText = $"[{runText}]({url})";
                            }
                        }
                    }
                }

                textBuilder.Append(runText);
            }

            return textBuilder.ToString();
        }

        private void ProcessTable(Table table, StringBuilder markdown)
        {
            // 获取所有行
            var rows = table.Elements<DocumentFormat.OpenXml.Wordprocessing.TableRow>().ToList();
            if (!rows.Any()) return;

            // 确定列数（使用第一行）
            int columnCount = rows[0].Elements<TableCell>().Count();

            // 添加表头分隔符
            StringBuilder headerRow = new StringBuilder("|");
            StringBuilder separatorRow = new StringBuilder("|");

            for (int i = 0; i < columnCount; i++)
            {
                headerRow.Append(" |");
                separatorRow.Append(" --- |");
            }

            // 处理表头（假设第一行是表头）
            var firstRow = rows[0];
            markdown.Append("|");

            foreach (var cell in firstRow.Elements<TableCell>())
            {
                string cellText = string.Join("", cell.Descendants<Text>().Select(t => t.Text));
                // 处理单元格中的格式
                markdown.Append($" {cellText} |");
            }

            markdown.AppendLine();
            markdown.AppendLine(separatorRow.ToString());

            // 处理数据行
            for (int i = 1; i < rows.Count; i++)
            {
                var row = rows[i];
                markdown.Append("|");

                foreach (var cell in row.Elements<TableCell>())
                {
                    string cellText = string.Join("", cell.Descendants<Text>().Select(t => t.Text));
                    // 处理合并单元格
                    var spanAttr = cell.TableCellProperties?.GridSpan?.Val;
                    int span = spanAttr != null ? spanAttr.Value : 1;

                    markdown.Append($" {cellText} |");

                    // 为合并的单元格添加额外的分隔符
                    for (int j = 1; j < span; j++)
                    {
                        markdown.Append(" |");
                    }
                }

                markdown.AppendLine();
            }

            markdown.AppendLine();
        }

        private bool IsNumberingStyleBullet(Numbering numbering, NumberingInstance numDef, int level)
        {
            var abstractNumId = numDef.AbstractNumId?.Val;
            if (abstractNumId != null)
            {
                var abstractNum = numbering.Elements<AbstractNum>()
                    .FirstOrDefault(a => a.AbstractNumberId == abstractNumId);

                if (abstractNum != null)
                {
                    var levelDef = abstractNum.Elements<Level>()
                        .FirstOrDefault(l => l.LevelIndex == level);

                    if (levelDef != null)
                    {
                        var numFormat = levelDef.NumberingFormat?.Val;
                        return numFormat == NumberFormatValues.Bullet;
                    }
                }
            }

            return false;
        }

        // 用于存储表格样式信息的辅助类
        private class TableStyle
        {
            public string StyleId { get; set; }
            public string Name { get; set; }
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

        private string ProcessImage(OpenXmlPart imagePart)
        {
            string filename = IOPath.GetRandomFileName();
            string extension = imagePart.Uri.ToString().Split('.').Last();
            filename = IOPath.ChangeExtension(filename, extension);

            if (useBase64)
            {
                using var stream = imagePart.GetStream();
                using var ms = new MemoryStream();
                stream.CopyTo(ms);
                var imageBytes = ms.ToArray();
                var base64 = Convert.ToBase64String(imageBytes);
                var mimeType = GetMimeType(extension);
                return $"![image](data:{mimeType};base64,{base64})\n";
            }

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