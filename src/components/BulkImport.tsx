import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ColumnMapping {
  csvColumn: string;
  targetField: string;
}

interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
  isValid: boolean;
}

interface BulkImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'client' | 'employee';
  requiredFields: string[];
  optionalFields: string[];
  onImport: (data: Record<string, string>[]) => Promise<{ success: number; errors: string[] }>;
}

export function BulkImport({
  open,
  onOpenChange,
  entityType,
  requiredFields,
  optionalFields,
  onImport,
}: BulkImportProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  const allFields = [...requiredFields, ...optionalFields];

  const parseCSV = useCallback((text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    // For CSV files
    if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length < 2) {
        toast({
          variant: 'destructive',
          title: 'Invalid file',
          description: 'File must contain a header row and at least one data row',
        });
        return;
      }

      setCsvData(data);
      // Initialize mappings based on header names
      const headers = data[0];
      const initialMappings = headers.map(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const matchedField = allFields.find(field => 
          field.toLowerCase().replace(/[^a-z0-9]/g, '_') === normalizedHeader ||
          field.toLowerCase().includes(header.toLowerCase()) ||
          header.toLowerCase().includes(field.toLowerCase())
        );
        return {
          csvColumn: header,
          targetField: matchedField || '',
        };
      });
      setColumnMappings(initialMappings);
      setStep('mapping');
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      toast({
        variant: 'destructive',
        title: 'Excel files not supported yet',
        description: 'Please convert your file to CSV format and try again',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateMapping = (csvColumn: string, targetField: string) => {
    setColumnMappings(prev =>
      prev.map(m => (m.csvColumn === csvColumn ? { ...m, targetField } : m))
    );
  };

  const validateAndPreview = () => {
    const headers = csvData[0];
    const dataRows = csvData.slice(1);
    const emailIndex = columnMappings.findIndex(m => m.targetField.toLowerCase() === 'email');

    const seenEmails = new Set<string>();

    const parsed: ParsedRow[] = dataRows.map((row, rowIndex) => {
      const data: Record<string, string> = {};
      const errors: string[] = [];

      columnMappings.forEach((mapping, colIndex) => {
        if (mapping.targetField) {
          data[mapping.targetField] = row[colIndex] || '';
        }
      });

      // Check required fields
      requiredFields.forEach(field => {
        if (!data[field] || !data[field].trim()) {
          errors.push(`Missing required field: ${field}`);
        }
      });

      // Check email format and duplicates
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          errors.push('Invalid email format');
        } else if (seenEmails.has(data.email.toLowerCase())) {
          errors.push('Duplicate email in file');
        } else {
          seenEmails.add(data.email.toLowerCase());
        }
      }

      return {
        data,
        errors,
        isValid: errors.length === 0,
      };
    });

    setParsedRows(parsed);
    setStep('preview');
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid).map(r => r.data);
    
    if (validRows.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No valid rows',
        description: 'Please fix the errors and try again',
      });
      return;
    }

    setStep('importing');

    try {
      const result = await onImport(validRows);
      setImportResult(result);
      setStep('complete');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: 'An error occurred during import',
      });
      setStep('preview');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setCsvData([]);
    setColumnMappings([]);
    setParsedRows([]);
    setImportResult(null);
    onOpenChange(false);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import {entityType === 'client' ? 'Clients' : 'Employees'}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import {entityType === 'client' ? 'clients' : 'employees'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <div className="py-8">
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV files. Max 1000 rows.
                </p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-2">Required fields:</p>
                <div className="flex flex-wrap gap-2">
                  {requiredFields.map(field => (
                    <Badge key={field} variant="secondary">{field}</Badge>
                  ))}
                </div>
                <p className="text-sm font-medium mt-4 mb-2">Optional fields:</p>
                <div className="flex flex-wrap gap-2">
                  {optionalFields.map(field => (
                    <Badge key={field} variant="outline">{field}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Map your CSV columns to the corresponding fields
              </p>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {columnMappings.map((mapping) => (
                    <div key={mapping.csvColumn} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{mapping.csvColumn}</p>
                        <p className="text-xs text-muted-foreground">
                          Sample: {csvData[1]?.[csvData[0].indexOf(mapping.csvColumn)] || '-'}
                        </p>
                      </div>
                      <Select
                        value={mapping.targetField}
                        onValueChange={(value) => updateMapping(mapping.csvColumn, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- Skip --</SelectItem>
                          {allFields.map(field => (
                            <SelectItem key={field} value={field}>
                              {field}
                              {requiredFields.includes(field) && ' *'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  {validCount} valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {invalidCount} errors
                  </Badge>
                )}
              </div>
              
              <ScrollArea className="h-[400px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      {columnMappings
                        .filter(m => m.targetField)
                        .map(m => (
                          <TableHead key={m.targetField}>{m.targetField}</TableHead>
                        ))}
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row, idx) => (
                      <TableRow key={idx} className={cn(!row.isValid && 'bg-destructive/5')}>
                        <TableCell>
                          {row.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        {columnMappings
                          .filter(m => m.targetField)
                          .map(m => (
                            <TableCell key={m.targetField} className="max-w-[200px] truncate">
                              {row.data[m.targetField] || '-'}
                            </TableCell>
                          ))}
                        <TableCell className="text-destructive text-xs max-w-[300px]">
                          {row.errors.join(', ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Importing data...</p>
              <p className="text-sm text-muted-foreground">Please wait while we process your file</p>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-success mb-4" />
              <p className="text-lg font-medium mb-2">Import Complete!</p>
              <p className="text-muted-foreground mb-4">
                Successfully imported {importResult.success} {entityType}(s)
              </p>
              {importResult.errors.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 text-left">
                  <p className="font-medium text-destructive mb-2">Some rows failed:</p>
                  <ul className="text-sm text-destructive list-disc list-inside">
                    {importResult.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>...and {importResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={validateAndPreview}>
                Validate & Preview
              </Button>
            </>
          )}
          
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} {entityType}(s)
              </Button>
            </>
          )}
          
          {step === 'complete' && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
