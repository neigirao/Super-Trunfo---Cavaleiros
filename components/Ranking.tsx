import React from 'react';
import { RankingEntry } from '../types';

interface RankingProps {
  rankingData: RankingEntry[];
  onBack: () => void;
}

export const Ranking: React.FC<RankingProps> = ({ rankingData, onBack }) => {
  return (
    <div className="w-full max-w-4xl p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-2xl">
      <h1 className="text-5xl font-bold font-cinzel mb-8 text-center text-purple-300">Ranking de Jogadores</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-sm text-purple-200 uppercase bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 rounded-l-lg">Pos.</th>
              <th scope="col" className="px-6 py-3">Jogador</th>
              <th scope="col" className="px-6 py-3 text-center">Vitórias</th>
              <th scope="col" className="px-6 py-3 rounded-r-lg text-right">Pontuação</th>
            </tr>
          </thead>
          <tbody>
            {rankingData.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-slate-400 text-lg">
                  O ranking ainda está vazio. Jogue para aparecer aqui!
                </td>
              </tr>
            ) : (
              rankingData.map((entry) => (
                <tr key={entry.rank} className="border-b border-slate-700 hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-bold text-2xl text-purple-300">{entry.rank}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img className="w-10 h-10 rounded-full mr-4" src={entry.user.picture} alt={entry.user.name} />
                      <span className="font-semibold">{entry.user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-lg">{entry.wins}</td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-green-400">{entry.score.toLocaleString('pt-BR')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
       <div className="text-center mt-8">
            <button
              onClick={onBack}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Voltar ao Menu
            </button>
        </div>
    </div>
  );
};