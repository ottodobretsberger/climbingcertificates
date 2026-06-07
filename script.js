const form = document.getElementById("certificate-form");
const certificate = document.getElementById("certificate");
const downloadPdfButton = document.getElementById("downloadPdfButton");
const printButton = document.getElementById("printButton");

const fields = {
    eventName: document.getElementById("eventNameInput"),
    participantName: document.getElementById("participantNameInput"),
    placing: document.getElementById("placingInput"),
    date: document.getElementById("dateInput"),
    city: document.getElementById("cityInput")
};

const formatYear = (value) => {
    if (!value) {
        return new Date().getFullYear().toString();
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return new Date().getFullYear().toString();
    }

    return date.getFullYear().toString();
};

const updatePreview = () => {
    document.querySelectorAll("[data-bind='eventName']").forEach((element) => {
        element.textContent = fields.eventName.value || "Veranstaltungsname";
    });

    document.querySelectorAll("[data-bind='participantName']").forEach((element) => {
        element.textContent = fields.participantName.value || "Teilnehmername";
    });

    document.querySelectorAll("[data-bind='placing']").forEach((element) => {
        element.textContent = fields.placing.value || "1.";
    });

    document.querySelectorAll("[data-bind='city']").forEach((element) => {
        element.textContent = fields.city.value || "Ort";
    });

    document.querySelectorAll("[data-bind='year']").forEach((element) => {
        element.textContent = formatYear(fields.date.value);
    });
};

Object.values(fields).forEach((field) => {
    field.addEventListener("input", updatePreview);
    field.addEventListener("change", updatePreview);
});

form.addEventListener("reset", () => {
    window.requestAnimationFrame(updatePreview);
});

printButton.addEventListener("click", () => {
    window.print();
});

downloadPdfButton.addEventListener("click", async () => {
    if (typeof window.html2pdf !== "function") {
        window.print();
        return;
    }

    const originalWidth = certificate.style.width;
    const originalMinHeight = certificate.style.minHeight;
    const originalHeight = certificate.style.height;
    const originalMargin = certificate.style.margin;

    certificate.style.width = "210mm";
    certificate.style.minHeight = "297mm";
    certificate.style.height = "297mm";
    certificate.style.margin = "0 auto";

    const eventLabel = (fields.eventName.value || "Urkunde").trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
    const fileName = `${eventLabel || "Urkunde"}-${new Date().toISOString().slice(0, 10)}.pdf`;

    const options = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all"] }
    };

    try {
        await window.html2pdf().set(options).from(certificate).save();
    } finally {
        certificate.style.width = originalWidth;
        certificate.style.minHeight = originalMinHeight;
        certificate.style.height = originalHeight;
        certificate.style.margin = originalMargin;
    }
});

fields.date.value = new Date().toISOString().split("T")[0];
updatePreview();