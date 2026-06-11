'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESEROS_MAX_LENGTH = 100;

function validateReviewInput({ nombre, correo, meseros }) {
  const errors = {};

  if (!nombre || nombre.trim().length < 2) {
    errors.nombre = 'Ingresa tu nombre (mínimo 2 caracteres).';
  }

  if (!correo || !EMAIL_RE.test(correo)) {
    errors.correo = 'Ingresa un correo válido.';
  }

  if (meseros !== undefined && meseros !== null && meseros !== '') {
    const trimmed = String(meseros).trim();
    if (trimmed.length > MESEROS_MAX_LENGTH) {
      errors.meseros = 'El nombre del mesero no puede superar 100 caracteres.';
    }
  }

  return errors;
}

function normalizeReviewInput({ nombre, correo, meseros }) {
  const trimmedMeseros =
    meseros === undefined || meseros === null ? '' : String(meseros).trim();
  const normalizedMeseros = trimmedMeseros === '' ? null : trimmedMeseros;

  return {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    meseros: normalizedMeseros,
  };
}

module.exports = {
  validateReviewInput,
  normalizeReviewInput,
};
