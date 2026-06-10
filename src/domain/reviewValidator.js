'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OCASION_OPTIONS = [
  { value: 'cena_casual', label: 'Cena casual' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'almuerzo', label: 'Almuerzo' },
  { value: 'networking', label: 'Networking' },
  { value: 'otros', label: 'Otros' },
  { value: 'festival_musical', label: 'Festival musical' },
  { value: 'cumpleanos', label: 'Cumpleaños' },
];

const VALID_OCASION_VALUES = new Set(OCASION_OPTIONS.map((o) => o.value));
const MESEROS_MAX_LENGTH = 100;

function normalizeOcasion(ocasion) {
  if (typeof ocasion === 'string') {
    const value = ocasion.trim();
    return VALID_OCASION_VALUES.has(value) ? [value] : [];
  }
  if (!Array.isArray(ocasion)) return [];
  const values = [
    ...new Set(ocasion.map((v) => String(v).trim()).filter((v) => VALID_OCASION_VALUES.has(v))),
  ];
  return values.length ? [values[0]] : [];
}

function validateReviewInput({ nombre, correo, calificacion, comentario, meseros, ocasion }) {
  const errors = {};

  if (!nombre || nombre.trim().length < 2) {
    errors.nombre = 'Ingresa tu nombre (mínimo 2 caracteres).';
  }

  if (!correo || !EMAIL_RE.test(correo)) {
    errors.correo = 'Ingresa un correo válido.';
  }

  if (!calificacion || calificacion < 1 || calificacion > 5) {
    errors.calificacion = 'Selecciona una calificación del 1 al 5.';
  }

  if (!comentario || !comentario.trim()) {
    errors.comentario = 'Escribe un comentario.';
  }

  if (meseros !== undefined && meseros !== null && meseros !== '') {
    const trimmed = String(meseros).trim();
    if (trimmed.length > MESEROS_MAX_LENGTH) {
      errors.meseros = 'El nombre del mesero no puede superar 100 caracteres.';
    }
  }

  const selectedOcasion = normalizeOcasion(ocasion);
  if (selectedOcasion.length === 0) {
    errors.ocasion = 'Selecciona un tipo de evento.';
  }

  return errors;
}

function normalizeReviewInput({ nombre, correo, calificacion, comentario, meseros, ocasion }) {
  const trimmedMeseros =
    meseros === undefined || meseros === null ? '' : String(meseros).trim();
  const normalizedMeseros = trimmedMeseros === '' ? null : trimmedMeseros;

  return {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    calificacion: Number(calificacion),
    comentario: comentario.trim(),
    meseros: normalizedMeseros,
    ocasion: normalizeOcasion(ocasion),
  };
}

module.exports = {
  OCASION_OPTIONS,
  validateReviewInput,
  normalizeReviewInput,
  normalizeOcasion,
};
