import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

export const slugify = (text: string): string => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // replace spaces with -
        .replace(/[^\w-]+/g, '') // remove non-word chars
        .replace(/--+/g, '-'); // replace multiple - with single -
};

export const captureElementAsDataURL = async (element: HTMLElement): Promise<string> => {
    // Temporarily force background to white
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#ffffff';

    try {
        const dataUrl = await toPng(element, {
            pixelRatio: 2, // High resolution
            backgroundColor: '#ffffff',
            style: {
                backgroundColor: '#ffffff'
            }
        });
        return dataUrl;
    } finally {
        element.style.backgroundColor = originalBg;
    }
};

export const downloadImage = (dataUrl: string, filename: string) => {
    saveAs(dataUrl, filename);
};
