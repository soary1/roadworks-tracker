import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '..', 'logo.png');
const baseDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Densités Android avec leurs tailles en pixels
const densities = {
  'ldpi': 36,
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192
};

(async () => {
  try {
    console.log('Génération des icônes pour Android...');
    
    for (const [density, size] of Object.entries(densities)) {
      const dir = path.join(baseDir, `mipmap-${density}`);
      
      // Créer le répertoire s'il n'existe pas
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Générer ic_launcher.png (version standard)
      const launcherPath = path.join(dir, 'ic_launcher.png');
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(launcherPath);
      
      // Générer ic_launcher_round.png (version arrondie)
      const roundPath = path.join(dir, 'ic_launcher_round.png');
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(roundPath);
      
      console.log(`✓ Icône générée: ${density} (${size}x${size})`);
    }
    
    console.log('\n✓ Toutes les icônes ont été générées avec succès !');
  } catch (error) {
    console.error('Erreur lors de la génération des icônes:', error);
    process.exit(1);
  }
})();
