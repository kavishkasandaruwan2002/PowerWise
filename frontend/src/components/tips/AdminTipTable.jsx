import React from 'react';
import { Badge, Button, Card } from '../ui';

const AdminTipTable = ({ tips, onEdit, onDeactivate, busyAction }) => {
  return (
    <Card className="bg-[#161b2a] border border-slate-800 rounded-[2rem] p-0 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead className="bg-[#0b0e14] border-b border-slate-800">
            <tr>
              {['Title', 'Category', 'Effort', 'Savings Model', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.22em] font-black text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tips.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-bold">
                  No tips found for the current filters.
                </td>
              </tr>
            ) : (
              tips.map((tip) => (
                <tr key={tip._id} className="border-b border-slate-800/60 last:border-b-0">
                  <td className="px-6 py-5 align-top">
                    <div>
                      <p className="text-white font-black tracking-tight">{tip.title}</p>
                      <p className="text-slate-500 text-sm font-bold mt-1 max-w-md">{tip.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top text-slate-300 font-bold">{tip.category}</td>
                  <td className="px-6 py-5 align-top text-slate-300 font-bold">{tip.effortLevel}</td>
                  <td className="px-6 py-5 align-top text-slate-300 font-bold">{tip.savingsModel?.type}</td>
                  <td className="px-6 py-5 align-top">
                    <Badge variant={tip.isActive ? 'info' : 'neutral'} className={tip.isActive ? 'bg-emerald-500/10 text-emerald-400' : ''}>
                      {tip.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="flex gap-3">
                      <Button type="button" variant="secondary" onClick={() => onEdit(tip)} className="!rounded-2xl !text-[10px] !uppercase !tracking-[0.16em]">
                        Edit
                      </Button>
                      {tip.isActive && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => onDeactivate(tip._id)}
                          disabled={busyAction === `${tip._id}-deactivate`}
                          className="!rounded-2xl !text-[10px] !uppercase !tracking-[0.16em]"
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AdminTipTable;
