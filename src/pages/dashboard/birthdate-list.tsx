import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Gift, Calendar, Mail, Loader } from "lucide-react";

interface Props {
  member_id: string;
  name: string;
  email: string;
  birthdate: string;
  formattedBirthdate: string;
  key: string;
}

export const BirthdateList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["birthdate-list"],
    queryFn: async () => {
      const response = await api.post<Props[]>(
        "/user/rodeoclub/birthdate-list"
      );

      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  function getDescription() {
    if (isLoading) return null;
    if (!data) return null;
    const todayMembers = data?.filter((member) => member.key === "today");

    return (
      <p className="text-sm font-normal opacity-90">
        {todayMembers.length > 0
          ? `${todayMembers.length} aniversariante${
              todayMembers.length > 1 ? "s" : ""
            } hoje`
          : "Ninguém faz aniversário hoje"}
      </p>
    );
  }

  const sortedList = data?.sort((a, b) => {
    if (a.key === "today" && b.key !== "today") {
      return -1;
    }
    if (b.key === "today" && a.key !== "today") {
      return 1;
    }
    return 0;
  });

  return (
    <div className="p-6 bg-gradient-to-br  min-h-screen">
      <Card className="w-full max-w-3xl mx-auto shadow-xl h-[600px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
        <CardHeader className="bg-gradient-to-r from-amber-400 to-amber-400 text-white rounded-t-lg p-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Gift className="w-8 h-8" />
            <div>
              <h2 className="font-bold">Próximos aniversariantes</h2>
              {getDescription()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center flex-1 justify-center">
              <Loader className="animate-spin w-4 h-4" />
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedList?.map((member) => {
                return (
                  <div
                    key={member.member_id}
                    className={`group relative bg-white rounded-xl border transition-all duration-300 hover:shadow-lg ${
                      member.key === "today"
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                              member.key === "today"
                                ? "bg-blue-100"
                                : "bg-gradient-to-br from-blue-50 to-purple-50"
                            }`}
                          >
                            <span className="text-2xl">
                              {member.birthdate.split("/")[0]}
                            </span>
                          </div>
                        </div>

                        <div className="flex-grow space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {member.name}
                            <span className="ml-2 inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                              {member.formattedBirthdate}
                            </span>
                          </h3>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span>{member.birthdate}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-[#675f4a]" />
                              <a
                                href={`mailto:${member.email}`}
                                className="text-[#675f4a] hover:text-[#ab9e7c] hover:underline"
                              >
                                {member.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {data && data.length === 0 && (
                <p className="text-center text-foreground">
                  Nenhum aniversariante do mês
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
