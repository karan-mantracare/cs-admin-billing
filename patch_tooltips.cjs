const fs = require('fs');

function patchFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix cursor and positioning
  content = content.replace(
    /bottom: '100%',/g,
    "bottom: '120%',"
  );
  content = content.replace(
    /cursor: 'help'/g,
    "cursor: 'pointer'"
  );

  // If BillingDetailsModal, remove overflow: hidden
  if (file.includes('BillingDetailsModal')) {
    content = content.replace(
      /boxShadow: '0 20px 40px rgba\(0,0,0,0\.15\)', overflow: 'hidden'/g,
      "boxShadow: '0 20px 40px rgba(0,0,0,0.15)'"
    );
  }

  fs.writeFileSync(file, content);
}

patchFile('src/components/BillingDetailsModal.jsx');
patchFile('src/pages/AddOrder.jsx');

console.log('Tooltips patched');
