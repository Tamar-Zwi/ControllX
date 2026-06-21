import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Globe2, MessageSquare } from 'lucide-react';
import { ChatWindow } from '../components/ChatWindow';
import { useAuth } from '../hooks/useAuth'; 
import { 
  useGetAgentsByDeptQuery, 
  useGetMissionsByManagerQuery, 
  useGetUnreadCountQuery 
} from '../store/apiSlice';

const AgentContactButton = ({ agent, fromMission, allMissions, selectedAgent, isGroupChat, onSelect, managerId }: any) => {
  const activeMissionId = useMemo(() => {
    if (fromMission?.id) return fromMission.id;
    const m = allMissions.find((m: any) => 
      (m.status === 'IN_PROGRESS' || m.status === 'PENDING') &&
      m.assignedAgents?.some((a: any) => a.id === agent.id)
    );
    return m?.id;
  }, [fromMission, allMissions, agent.id]);

  const shouldFetchUnread = Boolean(activeMissionId && managerId && selectedAgent?.id !== agent.id);

  const { data: unreadCount = 0 } = useGetUnreadCountQuery(
    { missionId: activeMissionId, senderId: agent.id, myId: managerId },
    { skip: !shouldFetchUnread, pollingInterval: 5000 }
  );

  const unread = selectedAgent?.id === agent.id ? 0 : unreadCount;

  return (
    <button
      onClick={() => onSelect(agent)}
      className={`w-full p-3 rounded-lg border-2 transition-all text-left mb-2 ${
        selectedAgent?.id === agent.id && !isGroupChat
          ? 'bg-emerald-600/50 border-emerald-300 shadow-[0_0_10px_#34d399]'
          : 'bg-emerald-900/40 border-emerald-700/40 hover:border-emerald-500/60'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${agent.status === 'ON_MISSION' ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
          <span className="text-xs font-bold text-emerald-200 uppercase truncate">{agent.codename}</span>
        </div>
        {unread > 0 && selectedAgent?.id !== agent.id && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>
      <div className="text-xs text-emerald-600 font-mono truncate">{agent.specialty}</div>
    </button>
  );
};

const AdminMessages = () => {
  const location = useLocation();
  const fromMission = location.state?.fromMission || null;

  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isGroupChat, setIsGroupChat] = useState<boolean>(false);

  const { user: manager } = useAuth();
  const managerDept = manager?.department || 'OPERATIONS'; 
  const managerId = manager?.id;

  const { data: agentsData = [], isLoading: agentsLoading } = useGetAgentsByDeptQuery(managerDept, { skip: !managerDept });
  const { data: allMissions = [], isLoading: missionsLoading } = useGetMissionsByManagerQuery(managerId || 0, { skip: !managerId });
  const loading = agentsLoading || missionsLoading;

  const agents = useMemo(() => {
    if (fromMission && fromMission.assignedAgents) {
      const missionAgentIds = fromMission.assignedAgents.map((a: any) => a.id);
      return agentsData.filter((a: any) => missionAgentIds.includes(a.id));
    }
    return agentsData;
  }, [agentsData, fromMission]);

  const currentMissionId = useMemo(() => {
    if (fromMission?.id) return fromMission.id;
    if (selectedAgent) {
      const m = allMissions.find((m: any) => 
        (m.status === 'IN_PROGRESS' || m.status === 'PENDING') &&
        m.assignedAgents?.some((a: any) => a.id === selectedAgent.id)
      );
      return m?.id;
    }
    return null;
  }, [fromMission, selectedAgent, allMissions]);

  const selectAgent = (agent: any) => {
    setIsGroupChat(false);
    setSelectedAgent(agent);
  };

  const selectGroupChat = () => {
    setSelectedAgent(null);
    setIsGroupChat(true);
  };

  return (
    <AdminLayout>
      <div className="h-full flex flex-col gap-4 font-mono">
        <header className="pb-4 border-b border-emerald-700/40 flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-3xl font-black text-emerald-300 uppercase tracking-widest">
              {fromMission ? `CHAT: ${fromMission.title}` : 'COMMUNICATIONS CENTER'}
            </h1>
          </div>
        </header>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="w-64 flex flex-col bg-[#02120e]/60 border border-emerald-700/40 rounded-lg overflow-hidden shrink-0">
            <div className="flex-1 overflow-y-auto space-y-2 p-3 custom-scrollbar">
              {loading ? (
                <div className="text-center py-8 text-emerald-600 text-xs animate-pulse">LOADING...</div>
              ) : (
                <>
                  {fromMission && (
                    <button
                      onClick={selectGroupChat}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left mb-4 ${
                        isGroupChat ? 'bg-emerald-600/50 border-emerald-300' : 'bg-emerald-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-emerald-100">
                        <Globe2 size={16} /> OP BROADCAST
                      </div>
                    </button>
                  )}
                  {agents.map((agent: any) => (
                    <AgentContactButton
                      key={agent.id}
                      agent={agent}
                      fromMission={fromMission}
                      allMissions={allMissions}
                      selectedAgent={selectedAgent}
                      isGroupChat={isGroupChat}
                      onSelect={selectAgent}
                      managerId={managerId}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#02120e]/60 border border-emerald-700/40 rounded-lg overflow-hidden relative">
            {currentMissionId && (selectedAgent || isGroupChat) ? (
              <ChatWindow 
                currentUser={manager} 
                missionId={currentMissionId} 
                selectedAgentId={selectedAgent?.id || null} 
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-emerald-900/50">
                <MessageSquare size={48} className="mb-4" />
                <p>Select asset or broadcast to start</p>
                {/* הודעה חדשה: אם בחרת סוכן שאין לו משימה פעילה עכשיו */}
                {selectedAgent && !currentMissionId && (
                  <p className="text-red-500 font-bold text-xs mt-2 animate-pulse uppercase tracking-widest">
                    AGENT HAS NO ACTIVE MISSION
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;