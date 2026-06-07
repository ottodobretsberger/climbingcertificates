const form = document.getElementById("certificate-form");
const certificate = document.getElementById("certificate");
const downloadPdfButton = document.getElementById("downloadPdfButton");

const fields = {
    eventName: document.getElementById("eventNameInput"),
    participantName: document.getElementById("participantNameInput"),
    placing: document.getElementById("placingInput"),
    date: document.getElementById("dateInput"),
    city: document.getElementById("cityInput")
};

const logoImage = document.querySelector(".certificate__logo");

const toJpegDataUrl = (imgElement) => {
    if (!imgElement) {
        return null;
    }

    const width = imgElement.naturalWidth || imgElement.width;
    const height = imgElement.naturalHeight || imgElement.height;

    if (!width || !height) {
        return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
        return null;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(imgElement, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.96);
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

const toIsoDate = (value) => {
    if (!value) {
        return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parts = value.split(/[./-]/);
    if (parts.length !== 3) {
        return "";
    }

    const [day, month, year] = parts;
    if (!day || !month || !year) {
        return "";
    }

    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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

    const isoDate = toIsoDate(fields.date.value);
    document.querySelectorAll("[data-bind='year']").forEach((element) => {
        element.textContent = formatYear(isoDate);
    });
};

Object.values(fields).forEach((field) => {
    field.addEventListener("input", updatePreview);
    field.addEventListener("change", updatePreview);
});

downloadPdfButton.addEventListener("click", async () => {
    if (typeof window.html2canvas !== "function" || !window.jspdf || !window.jspdf.jsPDF) {
        window.alert("PDF-Export ist nicht verfuegbar. Bitte Seite neu laden.");
        return;
    }

    const originalWidth = certificate.style.width;
    const originalMinHeight = certificate.style.minHeight;
    const originalHeight = certificate.style.height;
    const originalMargin = certificate.style.margin;
    const originalLogoSrc = logoImage ? logoImage.getAttribute("src") : null;

    certificate.style.width = "210mm";
    certificate.style.minHeight = "297mm";
    certificate.style.height = "297mm";
    certificate.style.margin = "0 auto";

    const eventLabel = (fields.eventName.value || "Urkunde").trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
    const fileName = `${eventLabel || "Urkunde"}-${new Date().toISOString().slice(0, 10)}.pdf`;

    try {
        if (logoImage) {
            const jpegLogo = toJpegDataUrl(logoImage);
            if (jpegLogo) {
                logoImage.setAttribute("src", jpegLogo);
            }
        }

        const canvas = await window.html2canvas(certificate, {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: false,
            allowTaint: true,
            logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.96);
        const pdf = new window.jspdf.jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true
        });

        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
        pdf.save(fileName);
    } catch (error) {
        console.error("PDF export failed", error);
        window.alert("PDF konnte nicht erzeugt werden. Bitte Seite neu laden und erneut versuchen.");
    } finally {
        certificate.style.width = originalWidth;
        certificate.style.minHeight = originalMinHeight;
        certificate.style.height = originalHeight;
        certificate.style.margin = originalMargin;
        if (logoImage && originalLogoSrc) {
            logoImage.setAttribute("src", originalLogoSrc);
        }
    }
});

if (typeof window.flatpickr === "function") {
    if (window.flatpickr.l10ns && window.flatpickr.l10ns.de) {
        window.flatpickr.localize(window.flatpickr.l10ns.de);
    }

    window.flatpickr(fields.date, {
        locale: "de",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        defaultDate: new Date(),
        weekNumbers: false,
        onChange: () => updatePreview(),
        onReady: () => updatePreview()
    });
} else {
    fields.date.value = new Date().toISOString().split("T")[0];
}

updatePreview();