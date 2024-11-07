import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gift, Calendar, Mail } from "lucide-react";

export const AniversariantesSemana = () => {
  const aniversariantes = [
    {
      id: 1,
      nome: "Maria Silva",
      email: "maria.silva@empresa.com",
      dataNascimento: "1990-11-08",
    },
    {
      id: 2,
      nome: "João Santos",
      email: "joao.santos@empresa.com",
      dataNascimento: "1988-11-09",
    },
    {
      id: 3,
      nome: "Ana Oliveira",
      email: "ana.oliveira@empresa.com",
      dataNascimento: "1992-11-10",
    },
    {
      id: 4,
      nome: "Pedro Costa",
      email: "pedro.costa@empresa.com",
      dataNascimento: "1985-11-07",
    },
    {
      id: 5,
      nome: "Pedro Costa",
      email: "pedro.costa@empresa.com",
      dataNascimento: "1985-11-07",
    },
    {
      id: 6,
      nome: "Pedro Costa",
      email: "pedro.costa@empresa.com",
      dataNascimento: "1985-11-07",
    },
  ];

  const formatarData = (data: any) => {
    const [dia, mes, ano] = data.split("/");
    return new Date(`${ano}-${mes}-${dia}`);
  };

  const getDescricaoData = (data: any) => {
    const hoje = new Date();
    const dataAniversario = formatarData(data);
    const diffDias = Math.ceil(
      //@ts-ignore
      (dataAniversario - hoje) / (1000 * 60 * 60 * 24)
    );

    if (diffDias === 0) {
      return "Hoje";
    } else if (diffDias === 1) {
      return "Amanhã";
    } else if (diffDias === 2) {
      return "Depois de amanhã";
    } else if (diffDias < 0) {
      return `Há ${Math.abs(diffDias)} dias`;
    } else {
      return `Faltam ${diffDias} dias`;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br  min-h-screen">
      <Card className="w-full max-w-3xl mx-auto shadow-xl h-[600px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
        <CardHeader className="bg-gradient-to-r from-amber-400 to-amber-400 text-white rounded-t-lg p-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Gift className="w-8 h-8" />
            <div>
              <h2 className="font-bold">Aniversariantes da Semana</h2>
              <p className="text-sm font-normal opacity-90">
                {aniversariantes.length} pessoas fazem aniversário em breve
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {aniversariantes.map((pessoa) => {
              const dataAniversario = formatarData(pessoa.dataNascimento);
              const descricaoData = getDescricaoData(pessoa.dataNascimento);
              const isHoje = descricaoData === "Hoje";

              return (
                <div
                  key={pessoa.id}
                  className={`group relative bg-white rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    isHoje ? "border-blue-300 bg-blue-50" : "border-gray-100"
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                            isHoje
                              ? "bg-blue-100"
                              : "bg-gradient-to-br from-blue-50 to-purple-50"
                          }`}
                        >
                          <span className="text-2xl">
                            {dataAniversario.getDate()}
                          </span>
                        </div>
                      </div>

                      <div className="flex-grow space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {pessoa.nome}
                          {isHoje && (
                            <span className="ml-2 inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                              {descricaoData}
                            </span>
                          )}
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>{descricaoData}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-purple-500" />
                            <a
                              href={`mailto:${pessoa.email}`}
                              className="text-purple-600 hover:text-purple-700 hover:underline"
                            >
                              {pessoa.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
