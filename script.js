const form = document.getElementById('billing-form');
const productNameInput = document.getElementById('productName');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const billItemsEl = document.getElementById('billItems');
const discountInput = document.getElementById('discountPercent');
const taxInput = document.getElementById('taxPercent');
const subtotalEl = document.getElementById('subtotal');
const discountAmountEl = document.getElementById('discountAmount');
const taxAmountEl = document.getElementById('taxAmount');
const grandTotalEl = document.getElementById('grandTotal');
const clearBillBtn = document.getElementById('clearBill');
const resetBtn = document.getElementById('resetButton');
const printBtn = document.getElementById('printButton');
const itemCountEl = document.getElementById('itemCount');

let items = [];

function calculateBill(itemsArray, discountPercent = 0, taxPercent = 0) {
  const subtotal = itemsArray.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * (taxPercent / 100);
  const total = taxableAmount + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

function updateItemCount() {
  const count = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  itemCountEl.textContent = `${count} Item${count === 1 ? '' : 's'} • ${totalQty} Qty`;
}

function renderItems() {
  updateItemCount();

  if (items.length === 0) {
    billItemsEl.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No products added yet.</td>
      </tr>
    `;
    return;
  }

  billItemsEl.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${formatCurrency(item.quantity * item.price)}</td>
          <td>
            <button class="item-delete" type="button" data-id="${item.id}">Remove</button>
          </td>
        </tr>
      `
    )
    .join('');
}

function updateSummary() {
  const discountPercent = Number(discountInput.value) || 0;
  const taxPercent = Number(taxInput.value) || 0;
  const result = calculateBill(items, discountPercent, taxPercent);

  subtotalEl.textContent = formatCurrency(result.subtotal);
  discountAmountEl.textContent = formatCurrency(result.discount);
  taxAmountEl.textContent = formatCurrency(result.tax);
  grandTotalEl.textContent = formatCurrency(result.total);
}

function addItem(event) {
  event.preventDefault();

  const productName = productNameInput.value.trim();
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);

  if (!productName || !quantity || quantity <= 0 || !price || price < 0) {
    alert('Please enter a valid product name, quantity, and price.');
    return;
  }

  items.push({
    id: Date.now(),
    name: productName,
    quantity,
    price,
  });

  form.reset();
  quantityInput.value = 1;
  productNameInput.focus();
  renderItems();
  updateSummary();
}

function removeItem(id) {
  items = items.filter((item) => item.id !== id);
  renderItems();
  updateSummary();
}

function resetInvoice() {
  items = [];
  form.reset();
  quantityInput.value = 1;
  discountInput.value = 0;
  taxInput.value = 5;
  document.getElementById('customerName').value = 'Walk-in Customer';
  document.getElementById('invoiceNumber').value = 'INV-' + Math.floor(Math.random() * 9000 + 1000);
  renderItems();
  updateSummary();
}

function printInvoice() {
  if (items.length === 0) {
    alert('Please add at least one product before printing.');
    return;
  }

  window.print();
}

form.addEventListener('submit', addItem);
discountInput.addEventListener('input', updateSummary);
taxInput.addEventListener('input', updateSummary);

billItemsEl.addEventListener('click', (event) => {
  const removeBtn = event.target.closest('.item-delete');
  if (!removeBtn) return;

  const id = Number(removeBtn.dataset.id);
  removeItem(id);
});

clearBillBtn.addEventListener('click', () => {
  items = [];
  renderItems();
  updateSummary();
  form.reset();
  quantityInput.value = 1;
  discountInput.value = 0;
  taxInput.value = 5;
});

resetBtn.addEventListener('click', resetInvoice);
printBtn.addEventListener('click', printInvoice);

renderItems();
updateSummary();
