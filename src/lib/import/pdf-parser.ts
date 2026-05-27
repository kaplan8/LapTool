import pdfParse from "pdf-parse";

import type { PdfPageText } from "./pdf-question-extractor";

type TextItem = {
  str?: string;
  transform?: number[];
};

function renderTextItems(items: TextItem[]) {
  return items
    .map((item) => item.str ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/([?.!])\s+/g, "$1\n")
    .replace(/(\d{1,3}[.)])\s+/g, "\n$1 ")
    .trim();
}

export async function parsePdfPages(buffer: Buffer): Promise<PdfPageText[]> {
  const pages: PdfPageText[] = [];
  let currentPage = 0;

  await pdfParse(buffer, {
    pagerender: async (pageData) => {
      currentPage += 1;
      const textContent = await pageData.getTextContent();
      const text = renderTextItems(textContent.items as TextItem[]);
      pages.push({ pageNumber: currentPage, text });
      return text;
    },
  });

  return pages.length ? pages : [{ pageNumber: 1, text: "" }];
}
