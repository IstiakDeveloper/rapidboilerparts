<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Picqer\Barcode\BarcodeGeneratorPNG;

class BarcodeService
{
    /**
     * Generate a barcode image and save it to storage
     *
     * @param string $barcode
     * @return string The path to the generated barcode image
     */
    public function generateBarcodeImage(string $barcode): string
    {
        // Create barcode generator instance
        $generator = new BarcodeGeneratorPNG();

        try {
            // Generate barcode image
            $barcodeImage = $generator->getBarcode(
                $barcode,
                $generator::TYPE_CODE_128,
                3, // width factor
                50 // height
            );

            // Create filename using barcode
            $filename = 'barcodes/' . $barcode . '.png';

            // Store the barcode image
            Storage::disk('public')->put($filename, $barcodeImage);

            return $filename;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error generating barcode: ' . $e->getMessage());
            throw $e;
        }
    }
}
