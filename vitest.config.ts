import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

// functions/ tiene sus propios tests con node --test (cd functions; npm test)
export default mergeConfig(viteConfig, defineConfig({
  test: { exclude: [...configDefaults.exclude, 'functions/**'] },
}))
