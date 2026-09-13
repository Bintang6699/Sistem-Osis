import * as xlsx from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType } from 'docx';
import { formatRupiah, formatDateShort, formatDateTimeWITA } from './utils';

export function exportToExcel(transactions: any[], summary: any) {
  const data = transactions.map((tx, idx) => ({
    'No': idx + 1,
    'Tanggal': formatDateShort(tx.date),
    'Waktu': formatDateTimeWITA(tx.date || tx.created_at || new Date()),
    'Keterangan': tx.label,
    'Kategori': tx.category || '-',
    'Kas Masuk': tx.type === 'income' ? tx.amount : 0,
    'Kas Keluar': tx.type === 'expense' ? tx.amount : 0,
  }));

  data.push({
    'No': '',
    'Tanggal': '',
    'Waktu': '',
    'Keterangan': 'TOTAL',
    'Kategori': '',
    'Kas Masuk': summary.totalIncome,
    'Kas Keluar': summary.totalExpense,
  });

  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Laporan Keuangan");
  xlsx.writeFile(wb, `Laporan_Keuangan_${new Date().getTime()}.xlsx`);
}

export async function exportToWord(transactions: any[], summary: any) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: "Laporan Keuangan", bold: true, size: 32 })],
        }),
        new Paragraph({ text: `Total Pemasukan: ${formatRupiah(summary.totalIncome)}` }),
        new Paragraph({ text: `Total Pengeluaran: ${formatRupiah(summary.totalExpense)}` }),
        new Paragraph({ text: `Saldo Akhir: ${formatRupiah(summary.balance)}`, spacing: { after: 400 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Tanggal" })] }),
                new TableCell({ children: [new Paragraph({ text: "Keterangan" })] }),
                new TableCell({ children: [new Paragraph({ text: "Kas Masuk" })] }),
                new TableCell({ children: [new Paragraph({ text: "Kas Keluar" })] }),
              ],
            }),
            ...transactions.map(tx => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: formatDateShort(tx.date) })] }),
                new TableCell({ children: [new Paragraph({ text: tx.label })] }),
                new TableCell({ children: [new Paragraph({ text: tx.type === 'income' ? formatRupiah(tx.amount) : '-' })] }),
                new TableCell({ children: [new Paragraph({ text: tx.type === 'expense' ? formatRupiah(tx.amount) : '-' })] }),
              ],
            })),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_Keuangan_${new Date().getTime()}.docx`;
  a.click();
}
