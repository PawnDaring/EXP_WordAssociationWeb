export async function generateMetadata(word: string): Promise<string[]> {
  try {
    const response = await fetch('/api/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      console.error('Backend error:', await response.text());
      return [];
    }

    const data = await response.json();
    return Array.isArray(data.metadata) ? data.metadata : [];
  } catch (error) {
    console.error('Error generating metadata:', error);
    return [];
  }
}
