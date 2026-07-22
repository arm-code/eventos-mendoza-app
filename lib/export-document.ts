// Exportación de documentos (nota de venta / contrato) en el navegador.
// Usa html-to-image para rasterizar el nodo y jsPDF para el PDF.

import { toPng } from 'html-to-image'

async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportNodeToImage(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await nodeToPng(node)
  triggerDownload(dataUrl, `${filename}.png`)
}

export async function exportNodeToPdf(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await nodeToPng(node)
  const { jsPDF } = await import('jspdf')

  const img = new Image()
  img.src = dataUrl
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })

  // Documento tamaño carta (216 x 279 mm)
  const pdf = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const usableWidth = pageWidth - margin * 2

  const imgRatio = img.height / img.width
  let renderWidth = usableWidth
  let renderHeight = usableWidth * imgRatio

  // Si excede una página, ajustar a la altura
  const usableHeight = pageHeight - margin * 2
  if (renderHeight > usableHeight) {
    renderHeight = usableHeight
    renderWidth = usableHeight / imgRatio
  }

  const x = (pageWidth - renderWidth) / 2
  pdf.addImage(dataUrl, 'PNG', x, margin, renderWidth, renderHeight)
  pdf.save(`${filename}.pdf`)
}
