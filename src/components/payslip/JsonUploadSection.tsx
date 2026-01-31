import { useState, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileJson, X, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import { useJsonUpload } from '@/hooks/use-json-upload';
import { SAMPLE_JSON_TEMPLATE } from '@/lib/payslip-utils';
import type { PayslipTemplate } from '@/types/payslip';

interface JsonUploadSectionProps {
  template: PayslipTemplate;
  authorizedSignatory: string;
  onPayslipsGenerated: (count: number) => void;
}

export function JsonUploadSection({
  template,
  authorizedSignatory,
  onPayslipsGenerated,
}: JsonUploadSectionProps) {
  const { uploadedPayslips, isLoading, errors, handleFileUpload, clearUpload, fileInputRef } = useJsonUpload();
  const [showSample, setShowSample] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, template, authorizedSignatory);
    }
  };

  const downloadSampleJson = () => {
    const jsonStr = JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-payslip-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-sans font-semibold">
          <FileJson className="h-5 w-5 text-primary" />
          Bulk Upload (JSON)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a JSON file containing employee data to generate multiple payslips at once.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSample(!showSample)}
          >
            {showSample ? 'Hide' : 'View'} Sample Format
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadSampleJson}
          >
            <Download className="h-4 w-4 mr-1" />
            Download Sample
          </Button>
        </div>

        {showSample && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sample JSON Format</Label>
            <Textarea
              value={JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2)}
              readOnly
              className="font-mono text-xs h-64"
            />
          </div>
        )}

        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            id="json-upload"
          />
          <label
            htmlFor="json-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isLoading ? 'Processing...' : 'Click to upload JSON file'}
            </span>
            <span className="text-xs text-muted-foreground">
              or drag and drop
            </span>
          </label>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {uploadedPayslips.length > 0 && (
          <Alert className="bg-success-light border-success">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Successfully parsed {uploadedPayslips.length} payslip(s) from JSON
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearUpload();
                  onPayslipsGenerated(0);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
