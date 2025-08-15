export const JWT_DEFAULT_EXPIRES_IN = '30h';
export const JWT_NEVER_EXPIRES = null;

export const DEFAULT_ALGORITHM = 'HS512';

export const VERIFY_OPTIONS =
  {
    //
    // Never forget to make this explicit to
    // prevent signature stripping attacks
    //
    algorithms: [ DEFAULT_ALGORITHM ]
  };
