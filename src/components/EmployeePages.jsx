import React, { useState } from 'react';
import {
  StatCard, Alert, Badge, ProgressBar, Btn, Timeline,
  FormGroup, Input, Select, SectionHeader,
} from './UI';
import GoalFormModal from './GoalFormModal';
import { computeProgress, progressColor, nowStr } from '../utils';
import { USERS } from '../data';

// ── Employee Dashboard ────────────────────────────────────────────────────────
export function EmpDashboard({ goals, onNavigate, currentUser = USERS.employee }) {
  const myGoals = goals.filter(g => g.empId === currentUser.id);
  const approved = myGoals.filter(g => g.status === 'Approved');
  const totalWeight = approved.reduce((s, g) => s + Number(g.weightage), 0);
  const onTrack   = myGoals.filter(g => g.checkStatus === 'On Track').length;
  const completed = myGoals.filter(g => g.checkStatus === 'Completed').length;

  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Total Goals"  value={myGoals.length}          sub="of 8 max"      color="var(--accent2)" />
        <StatCard label="Approved"     value={approved.length}         sub="locked in"     color="var(--green)"   />
        <StatCard label="Weightage"    value={`${totalWeight}%`}       sub={totalWeight === 100 ? 'balanced' : 'target 100%'} color={totalWeight === 100 ? 'var(--green)' : 'var(--amber)'} />
        <StatCard label="On Track"     value={onTrack + completed}     sub={`${myGoals.length - onTrack - completed} behind`} color="var(--teal)" />
      </div>

      <Alert type="info">
        📅 <strong>Q1 Check-in window is open (July)</strong> — Log your actual achievements before the window closes.{' '}
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onNavigate('checkin')}>Go to Check-ins →</span>
      </Alert>

      <div className="card" style={{ marginBottom: 16 }}>
        <SectionHeader title="Goal Progress" />
        {approved.map(g => (
          <div key={g.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{g.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 8, alignItems: 'center' }}>
                {g.weightage}% weight <Badge label={g.checkStatus} />
              </div>
            </div>
            <ProgressBar goal={g} />
          </div>
        ))}
        {approved.length === 0 && (
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>No approved goals yet.</div>
        )}
      </div>

      <div className="card">
        <SectionHeader title="Check-in Schedule" />
        <Timeline />
      </div>
    </div>
  );
}

// ── My Goals ──────────────────────────────────────────────────────────────────
export function MyGoals({ goals, setGoals, addAudit, showToast, currentUser = USERS.employee }) {
  const [modal, setModal] = useState(null); // null | 'add' | goalObj
  const myGoals = goals.filter(g => g.empId === currentUser.id);
  const totalWeight = myGoals.reduce((s, g) => s + Number(g.weightage), 0);
  const empName = currentUser.name;

  const handleAdd = newGoal => {
    setGoals(prev => [...prev, newGoal]);
    showToast('Goal added successfully');
  };

  const handleEdit = updated => {
    setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
    showToast('Goal updated');
  };

  const handleDelete = id => {
    const g = goals.find(x => x.id === id);
    if (!window.confirm(`Delete goal "${g.title}"?`)) return;
    setGoals(prev => prev.filter(x => x.id !== id));
    addAudit({ time: nowStr(), user: empName, action: `Deleted goal "${g.title}"` });
    showToast('Goal deleted');
  };

  const handleSubmit = () => {
    if (totalWeight !== 100) {
      showToast('Adjust total weightage to exactly 100% before submitting', 'warn');
      return;
    }

    setGoals(prev => prev.map(g =>
      g.empId === currentUser.id && g.status === 'Draft' ? { ...g, status: 'Pending' } : g
    ));
    const count = myGoals.filter(g => g.status === 'Draft').length;
    addAudit({ time: nowStr(), user: empName, action: `Submitted ${count} goal(s) for manager approval` });
    showToast(`${count} goal(s) submitted for approval`);
  };

  return (
    <div>
      {modal && (
        <GoalFormModal
          mode={typeof modal === 'string' ? 'add' : 'edit'}
          goal={typeof modal === 'object' ? modal : null}
          myGoals={myGoals}
          onSave={typeof modal === 'string' ? handleAdd : handleEdit}
          onClose={() => setModal(null)}
          addAudit={addAudit}
          empName={empName}
          empId={currentUser.id}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          Weightage used: <strong style={{ color: totalWeight === 100 ? 'var(--green)' : 'var(--amber)' }}>{totalWeight}%</strong>
          {' '}/ 100%
        </div>
        {myGoals.length < 8 && (
          <Btn variant="primary" onClick={() => setModal('add')}>+ Add Goal</Btn>
        )}
      </div>

      {totalWeight !== 100 && myGoals.length > 0 && (
        <Alert type="warn">
          ⚠️ Total weightage is <strong>{totalWeight}%</strong>. Goals must sum to exactly 100% before submitting.
        </Alert>
      )}

      {myGoals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 15, marginBottom: 8 }}>No goals yet</div>
          <Btn variant="primary" onClick={() => setModal('add')}>+ Add First Goal</Btn>
        </div>
      ) : (
        <>
          {myGoals.map((g, i) => (
            <div key={g.id} className="goal-item">
              <div className="goal-header">
                <div className="goal-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div className="goal-title">{g.title}</div>
                    {g.shared && <span className="badge badge-purple" style={{ fontSize: 10 }}>🔗 Shared</span>}
                    <Badge label={g.status} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                    {g.thrust} · UoM: {g.uom}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent2)' }}>{g.weightage}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>weight</div>
                </div>
              </div>

              <div className="goal-meta">
                <span>🎯 Target: <strong>{g.target} {g.unit}</strong></span>
                {g.actual != null && <span>✅ Actual: <strong>{g.actual} {g.unit}</strong></span>}
                {g.checkStatus && <span>Status: <Badge label={g.checkStatus} /></span>}
              </div>

              <div className="weight-bar">
                <div className="weight-fill" style={{ width: `${g.weightage}%` }} />
              </div>

              <div className="goal-actions">
                <Btn variant="ghost" size="sm" onClick={() => setModal(g)}>
                  {g.locked ? 'Edit Goal' : 'Edit'}
                </Btn>
                <Btn variant="danger" size="sm" onClick={() => handleDelete(g.id)}>Delete</Btn>
                {g.locked && (
                  <span style={{ alignSelf: 'center', fontSize: 11, color: 'var(--text3)' }}>
                    Seeded data
                  </span>
                )}
              </div>

              {g.managerComment && (
                <div style={{ marginTop: 10, background: 'var(--surface3)', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: 'var(--text2)' }}>
                  💬 Manager: {g.managerComment}
                </div>
              )}
            </div>
          ))}

          {myGoals.some(g => g.status === 'Draft') && totalWeight === 100 && (
            <Btn variant="primary" style={{ marginTop: 8, width: '100%' }} onClick={handleSubmit}>
              Submit {myGoals.filter(g => g.status === 'Draft').length} Goal(s) for Approval →
            </Btn>
          )}
        </>
      )}
    </div>
  );
}

// ── Employee Check-in ─────────────────────────────────────────────────────────
export function EmpCheckin({ goals, setGoals, addAudit, showToast, currentUser = USERS.employee }) {
  const approved = goals.filter(g => g.empId === currentUser.id && g.status === 'Approved');
  const [drafts, setDrafts] = useState(
    Object.fromEntries(approved.map(g => [g.id, { actual: g.actual ?? '', status: g.checkStatus }]))
  );
  const empName = currentUser.name;

  const save = id => {
    const d = drafts[id];
    const g = goals.find(x => x.id === id);
    const actual = g.uom === 'Timeline' ? d.actual : Number(d.actual);
    setGoals(prev => prev.map(x => x.id === id ? { ...x, actual, checkStatus: d.status } : x));
    addAudit({ time: nowStr(), user: empName, action: `Updated Q1 actual for "${g.title}": ${actual} ${g.unit}` });
    showToast('Achievement saved!');
  };

  return (
    <div>
      <Alert type="success">📋 Q1 Check-in is currently open. Update your actual achievements below.</Alert>
      {approved.map(g => {
        const d = drafts[g.id] || { actual: '', status: 'Not Started' };
        const tempGoal = { ...g, actual: g.uom === 'Timeline' ? d.actual : Number(d.actual) };
        return (
          <div key={g.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{g.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                  {g.thrust} · {g.weightage}% weight · UoM: <strong>{g.uom}</strong>
                </div>
              </div>
              <Badge label={g.checkStatus} />
            </div>

            <div className="form-row-3">
              <FormGroup label="Planned Target">
                <div className="form-input" style={{ background: 'var(--surface3)', cursor: 'default', color: 'var(--text)' }}>
                  {g.target} {g.unit}
                </div>
              </FormGroup>
              <FormGroup label="Actual Achievement">
                <Input
                  type={g.uom === 'Timeline' ? 'date' : 'number'}
                  value={d.actual}
                  onChange={e => setDrafts(prev => ({ ...prev, [g.id]: { ...d, actual: e.target.value } }))}
                />
              </FormGroup>
              <FormGroup label="Status">
                <Select
                  value={d.status}
                  onChange={e => setDrafts(prev => ({ ...prev, [g.id]: { ...d, status: e.target.value } }))}
                  options={['Not Started', 'On Track', 'Completed']}
                />
              </FormGroup>
            </div>

            {g.uom !== 'Timeline' && d.actual !== '' && (
              <div style={{ marginTop: 10 }}>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(computeProgress(tempGoal), 100)}%`, background: progressColor(computeProgress(tempGoal)) }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                  Progress score: {Math.round(computeProgress(tempGoal))}%
                </div>
              </div>
            )}

            <Btn variant="success" size="sm" style={{ marginTop: 12 }} onClick={() => save(g.id)}>
              Save Achievement
            </Btn>
          </div>
        );
      })}
      {approved.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>No approved goals to update.</div>
      )}
    </div>
  );
}
