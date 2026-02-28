document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.getElementById("transactionForm");
  formContainer.innerHTML = createTransactionForm();

  const dropdown = document.getElementById("supplierDropdown");
  const searchInput = document.getElementById("supplierSearch");
  const toggleButtons = document.querySelectorAll(".toggle-btn-group button");
  const hiddenInput = document.getElementById("payment_type");
  const invoiceDate = document.getElementById("invoiceDate");
  invoiceDate.value = new Date().toISOString().split("T")[0];

  toggleButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      toggleButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      hiddenInput.value = btn.dataset.value;
    }),
  );

  const transactionId = new URLSearchParams(window.location.search).get(
    "transaction_id",
  );
  loadSuppliers(dropdown, searchInput, transactionId);

  document.getElementById("editBtn").addEventListener("click", () => {
    disableForm(false);
    document.getElementById("submitBtn").style.display = "block";
    document.getElementById("editBtn").style.display = "none";
    document.getElementById("formTitle").textContent = "Edit Transaction";
  });

  const form = document.getElementById("transactionForm");
  let pendingPayload = null;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = +document.getElementById("amount").value;
    const invoice_no = +document.getElementById("invoice_no").value;
    const supplier_id = +dropdown.value;
    const payment_type = hiddenInput.value;
    const invoice_date = invoiceDate.value;

    if (!amount || !invoice_no || !supplier_id) {
      showToast("Please fill all fields!", true);
      return;
    }

    const supplierName = dropdown.options[dropdown.selectedIndex].text;
    document.getElementById("confirmMessage").innerHTML = `
      <strong>Supplier:</strong> ${supplierName}<br>
      <strong>Amount:</strong> ₹${amount}<br>
      <strong>Type:</strong> ${payment_type}<br>
      <strong>Date:</strong> ${invoice_date}
    `;

    pendingPayload = {
      amount,
      invoice_no,
      supplier_id,
      payment_type,
      invoice_date,
    };

    const modalEl = document.getElementById("confirmModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    document.getElementById("confirmSubmitBtn").onclick = async () => {
      modal.hide();
      const url = transactionId
        ? `/api/transaction/${transactionId}`
        : "/api/transaction";
      const method = transactionId ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingPayload),
        });

        const data = await res.json();

        if (res.ok) {
          showToast(
            transactionId ? "Updated successfully" : "Created successfully",
          );

          // --- START OF CHANGES ---

          // 1. Capture the payment type used in the successful transaction
          const lastPaymentType = pendingPayload.payment_type;

          // 2. Reset the form (clears amounts, invoice numbers, etc.)
          form.reset();

          // 3. Reset simple defaults
          invoiceDate.value = new Date().toISOString().split("T")[0];
          searchInput.value = "";
          dropdown.selectedIndex = 0;

          // 4. PERSIST THE PAYMENT TYPE
          // Set the hidden input to the previous transaction's type
          hiddenInput.value = lastPaymentType;

          // Update the visual toggle buttons to match
          document.querySelectorAll(".toggle-btn-group button").forEach((b) => {
            b.classList.remove("active");
            // Check if this button matches the last used type
            if (b.dataset.value === lastPaymentType) {
              b.classList.add("active");
            }
          });

          // --- END OF CHANGES ---

          pendingPayload = null;
        } else {
          showToast(data.message || "Error", true);
        }
      } catch (err) {
        console.error(err);
        showToast("Error submitting transaction", true);
      }
    };
  });
});
