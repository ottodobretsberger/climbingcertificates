const form = document.getElementById("certificate-form");
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

fields.date.value = new Date().toISOString().split("T")[0];
updatePreview();