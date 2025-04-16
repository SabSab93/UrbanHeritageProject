// src/stores/maillot.ts
import { defineStore } from 'pinia'

export interface Maillot {
  id_maillot: number
  id_tva: number
  nom_maillot: string
  pays_maillot: string
  description_maillot: string
  composition_maillot: string
  url_image_maillot_1: string
  url_image_maillot_2: string
  url_image_maillot_3: string
  origine: string
  tracabilite: string
  entretien: string
  prix_ht_maillot: number
}

export const useMaillotStore = defineStore('maillot', {
  state: () => ({
    maillots: [] as Maillot[],
    loading: false,
    error: ''
  }),
  actions: {
    async fetchMaillots() {
      this.loading = true
      try {
        // Si tu as une API qui renvoie les maillots, remplace l'URL par ton endpoint
        const res = await fetch('http://localhost:1992/api/maillots')
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des maillots')
        }
        this.maillots = await res.json()
      } catch (err) {
        this.error = (err as Error).message
      } finally {
        this.loading = false
      }
    }
  }
})
