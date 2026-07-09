function formatApiResponse(success, data = null, message = '', meta = null) {
  const response = { success };
  if (data) response.data = data;
  if (message) response.message = message;
  if (meta) response.meta = meta;
  return response;
}

function successResponse(data, message = 'Operación exitosa', meta = null) {
  return formatApiResponse(true, data, message, meta);
}

function paginatedResponse(data, page, limit, total) {
  return formatApiResponse(true, data, 'Operación exitosa', {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
}

module.exports = { successResponse, paginatedResponse, formatApiResponse };
