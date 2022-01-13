import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elixirlabs.elixir',
  appName: 'Elixir',
  webDir: 'public',
  bundledWebRuntime: false,
  server: {
    cleartext: true
  }  
};

export default config;
