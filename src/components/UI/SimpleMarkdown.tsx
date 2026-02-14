import React from 'react';

interface SimpleMarkdownProps {
    content: string;
}

export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
    if (!content) return null;

    // Split by newlines to handle blocks
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc pl-5 mb-4 space-y-1">
                    {listItems}
                </ul>
            );
            listItems = [];
        }
    };

    const parseLine = (line: string, index: number) => {
        // Bold: **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <span key={index} className="block mb-2 last:mb-0">
                {parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="font-bold text-primary-400">{part.slice(2, -2)}</strong>;
                    }
                    // Italic: *text* (basic support)
                    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
                    }
                    return part;
                })}
            </span>
        );
    };

    // Table parsing state
    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];

    const flushTable = () => {
        if (inTable && tableHeader.length > 0) {
            elements.push(
                <div key={`table-${elements.length}`} className="overflow-x-auto mb-4 rounded-lg border border-surface-overlay">
                    <table className="min-w-full divide-y divide-surface-overlay">
                        <thead className="bg-surface-raised">
                            <tr>
                                {tableHeader.map((th, i) => (
                                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        {th}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-surface-base divide-y divide-surface-overlay">
                            {tableRows.map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-surface-base' : 'bg-surface-raised/50'}>
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            inTable = false;
            tableHeader = [];
            tableRows = [];
        }
    };

    lines.forEach((line, index) => {
        // Code Blocks
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                // End code block
                elements.push(
                    <pre key={`code-${index}`} className="bg-surface-base p-3 rounded-lg overflow-x-auto mb-4 text-xs font-mono text-gray-300">
                        {codeBlockContent.join('\n')}
                    </pre>
                );
                codeBlockContent = [];
                inCodeBlock = false;
            } else {
                // Start code block
                flushList();
                flushTable();
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeBlockContent.push(line);
            return;
        }

        // Tables
        // Check for table header: | Header | Header |
        if (line.trim().startsWith('|') && line.trim().endsWith('|') && !inTable) {
            // Check if next line is separator: |---|---|
            const nextLine = lines[index + 1];
            if (nextLine && nextLine.trim().startsWith('|') && nextLine.includes('---')) {
                inTable = true;
                tableHeader = line.split('|').map(c => c.trim()).filter(c => c !== '');
                return; // Skip rendering this line, it's processed as header
            }
        }

        if (inTable) {
            // Ignore separator line
            if (line.includes('---')) return;

            // Process row
            if (line.trim().startsWith('|')) {
                const row = line.split('|').map(c => c.trim()).filter(c => c !== '');
                if (row.length > 0) {
                    tableRows.push(row);
                }
                return;
            } else {
                // End of table
                flushTable();
            }
        }

        // Headers
        if (line.startsWith('### ')) {
            flushList();
            flushTable();
            elements.push(<h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>);
            return;
        }
        if (line.startsWith('## ')) {
            flushList();
            flushTable();
            elements.push(<h2 key={index} className="text-xl font-bold text-white mt-6 mb-3 border-b border-surface-overlay pb-1">{line.replace('## ', '')}</h2>);
            return;
        }

        // Lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            flushTable();
            const content = line.trim().substring(2);
            listItems.push(
                <li key={`li-${index}`} className="text-gray-300">
                    {parseLine(content, 0).props.children}
                </li>
            );
            return;
        }

        // Regular paragraphs
        if (line.trim() !== '') {
            flushList();
            flushTable();
            elements.push(parseLine(line, index));
        }
    });

    flushList();
    flushTable();

    return <div className="text-gray-300 text-sm leading-relaxed">{elements}</div>;
};
