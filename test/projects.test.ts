import { CoreLogger } from '@vitechgroup/mkt-elec-core'
import { beforeAll, describe, it } from 'vitest'
import { LabsManager } from '../src'
import { logUpdate } from './helpers'

describe('projects', () => {
  let labsManager: LabsManager
  let logger: CoreLogger

  beforeAll(async () => {
    logger = CoreLogger.getInstance()

    labsManager = await new LabsManager().initDirectApi({
      cookies: '_ga=GA1.1.1664796651.1759475413; _ga_X5V89YHGSH=GS2.1.s1759475413$o1$g0$t1759475414$j59$l0$h0; _ga_5K7X2T4V16=GS2.1.s1759475415$o1$g0$t1759475416$j59$l0$h0; EMAIL=%22tu0c044a97%40betso.charity%22; __Secure-next-auth.callback-url=https%3A%2F%2Flabs.google; __Host-next-auth.csrf-token=9f6164984fbfc318eb65461f7b7b5b19eee8d34a8c5553996e8ef93cc8eab86c%7Cb85bcb38767680b906b67dce4ae031a3018b2ab7255fb54f36eef5110cf2dcc2; _ga_X2GNH8R5NS=GS2.1.s1759483144$o2$g0$t1759483145$j59$l0$h1232462705; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..rFgVU9gYyKoAaVcJ.OqBgIprcIOOg8LVdQfyFSeZoWTbDclYt2SynYLcWBCHZ7z85UgDm48NkgtLCrmoJZfPQ-TgPAf1NaEBgP43krZDavNLZl1m1EHtpa5lefAUD0yI-kJbRgH8I-twQtni7Pkn-oa_Bqx2DPbE628wgfoJoHTL3q8Cx5BVDCcGXpNCRYopUzAMyuXJ96nvmJcIpP4Pk-K8lsVX6gn7j937hhMohOoMJIAsOxeKA8RiHVE224lK5DAKsG-Crp-cWpVUcUIaFShWOD-u3-Qdet9zOsk7mHLpkp2lJmX0LOyn8b0lhuALCG16ynOA8IKxhWf4ZXJ_mahbjZKO3LJDJuTSJ8tYUPJD_LH8Vl6QyejIFHAwHVXyGd5AkxQvVVOpOUQdERWYUD2tA5u9I0KEs3PlVxENzAldLMvpoYIh4awPDTvm1nywc5rWYWCr5GY_osrlRxI68eE_33czYWEmXo4bBEl-tf-tZto3HR4ggYnHDR9uZWw7tHrJaIqlUyl1uWMDpxbAB94hphZXh2fSZjDkoAZ16tjWnuQwXLYdfkpvS89jbbCgkamGI8FTF11Hmtsvtwb8VDsc-KtlFZBCWn33UeRhajzjsnDQ7euNsORVGWc3IzA5IkddnpyxPyEKia5VLiPbbR7BAUgMoG9G-p0Sr-Us7Fc8NwmzZBLj8bm20oJ06c64CLAhnfJfGl5-XYt6T1L-yCZtt8lewPtAbyNdNMeax5O2gGkFWnVpoVGxW0zd_C7nnqA29cmPAM6Zr9Q9zskgXo0HJMDxk27tzXV8gAh5k1vh5hpKvDj_E6bt71CoYxImjLlfW4-KJlD7xWBtYd21m61l4okUXJi3ATB5A8lo-a2wsIrEWqvqQtX_3VQN7utn2nKaPj0WkXgYNpZKiM2dvv3-0Usb6_NuILrpDojy9j975XxerSz0_f3eToYheL-L4ROgFyGUMg_JhNTyuYn2aUY4-8Z7eVOmAjSZB7Lo3.MtAQyEog4sES9lO29QpXOQ',
    }, logUpdate)
  })

  it.skip('create', async () => {
    const result = await labsManager.directApi.useProjects.createProject({ projectTitle: 'test' })
    logger.info('Create project result', result)
  })
})
