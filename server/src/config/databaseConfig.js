const databaseConfig = Object.freeze({
  uri: 'mongodb+srv://rajeshpandhare181:tY5SOl2JowgJaSW7@cluster0.adymsmg.mongodb.net/propConnect?appName=Cluster0&retryWrites=true&w=majority',
  databaseName: 'propConnect',
  options: Object.freeze({
    serverSelectionTimeoutMS: 10000
  }),
  defaultUser: Object.freeze({
    name: 'System Admin',
    agencyName: 'PropConnect Admin',
    email: 'admin@propconnect.com',
    mobile: '9999999999',
    whatsapp: '9999999999',
    password: 'Admin@12345',
    role: 'admin',
    publicSlug: 'propconnect-admin',
    status: 'active'
  })
});

export default databaseConfig;
