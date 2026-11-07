import { listarImplementos } from './implementos';
import { listarQuimicos } from './quimicos';
import type { ElementoAlerta, Quimico } from './tipos';

export async function listarAlertas(): Promise<{
  inventarioBajo: ElementoAlerta[];
  porVencer: Quimico[];
  vencidos: Quimico[];
}> {
  const [implementosBajos, quimicos] = await Promise.all([
    listarImplementos({ soloBajos: true }),
    listarQuimicos(),
  ]);
  const quimicosBajos = quimicos.filter((quimico) => quimico.inventarioBajo);

  return {
    inventarioBajo: [
      ...implementosBajos.map((implemento) => ({ ...implemento, tipoElemento: 'implemento' as const })),
      ...quimicosBajos.map((quimico) => ({ ...quimico, tipoElemento: 'quimico' as const })),
    ],
    porVencer: quimicos.filter((quimico) => quimico.nivelVencimiento === 'proximo'),
    vencidos: quimicos.filter((quimico) => quimico.nivelVencimiento === 'vencido'),
  };
}
