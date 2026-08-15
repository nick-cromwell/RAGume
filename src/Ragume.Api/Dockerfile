FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/Ragume.Api/Ragume.Api.csproj ./src/Ragume.Api/
RUN dotnet restore ./src/Ragume.Api/Ragume.Api.csproj
COPY . .
WORKDIR /src/src/Ragume.Api
RUN dotnet publish ./Ragume.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Ragume.Api.dll"]
