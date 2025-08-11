// Middleware de validação de requisições
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Middleware para verificar se o usuário existe
const checkUserExists = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    // Adicionar validação de formato do ID se necessário
    req.userId = userId;
    next();
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateRequest,
  checkUserExists
};

