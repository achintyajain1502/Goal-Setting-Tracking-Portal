import React, { useState } from 'react';
import { Modal, FormGroup, Input, Select, Textarea, Btn, Alert } from './UI';
import { THRUST_AREAS } from '../data';
import { nowStr } from '../utils';

const UOM_OPTIONS = [
  { value: 'Min',      label: 'Min — Higher is better (e.g. Revenue)' },
  { value: 'Max',      label: 'Max — Lower is better (e.g. TAT, Cost)' },
  { value: 'Timeline', label: 'Timeline — Date-based completion'       },
  { value: 'Zero',     label: 'Zero — Zero equals 100% success'        },
];

export default function GoalFormModal({ mode, goal, myGoals, onSave, onClose, addAudit, empName }) {
  const usedWeight = myGoals
    .filter(g => g.empId === (goal?.empId || 'emp1') && (!goal || g.id !== goal.id))
    .reduce((s, g) => s + Number(g.weightage), 0);

  const [form, setForm] = useState({
    thrust:    goal?.thrust    || THRUST_AREAS[0],
    title:     goal?.title     || '',
    desc:      goal?.desc      || '',
    uom:       goal?.uom       || 'Min',
    target:    goal?.target    ?? '',
    unit:      goal?.unit      || '',
    weightage: goal?.weightage || '',
  });
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    if (!form.title.trim())              return 'Goal title is required.';
    const w = Number(form.weightage);
    if (!w || w < 10)                   return 'Minimum weightage per goal is 10%.';
    if (form.uom !== 'Zero' && form.uom !== 'Timeline' && !form.target)
                                         return 'Please enter a target value.';
    return null;
  };

  const totalAfterSave = usedWeight + Number(form.weightage || 0);
  const weightageWarning = totalAfterSave > 100
    ? `This will take total weightage to ${totalAfterSave}%. You can still save it as a draft, but must adjust the total to exactly 100% before submitting.`
    : '';

  const handleSave = () => {
    const err = validate();
    if (err) { setError(err); return; }

    const resolvedTarget =
      form.uom === 'Zero'     ? 0 :
      form.uom === 'Timeline' ? form.target :
      Number(form.target);

    if (mode === 'add') {
      const newGoal = {
        id: Date.now(),
        emp: empName, empId: 'emp1',
        thrust: form.thrust, title: form.title, desc: form.desc,
        uom: form.uom, target: resolvedTarget, unit: form.unit,
        weightage: Number(form.weightage),
        status: 'Draft', quarter: 'Q1',
        actual: null, checkStatus: 'Not Started',
        managerComment: '', locked: false, shared: false, sharedFrom: null,
      };
      addAudit({ time: nowStr(), user: empName, action: `Created new goal "${form.title}" (${form.weightage}% weight)` });
      onSave(newGoal);
    } else {
      const updated = {
        ...goal,
        thrust: form.thrust, title: form.title, desc: form.desc,
        uom: form.uom, target: resolvedTarget, unit: form.unit,
        weightage: Number(form.weightage),
      };
      addAudit({ time: nowStr(), user: empName, action: `Edited goal "${form.title}"` });
      onSave(updated);
    }
    onClose();
  };

  return (
    <Modal
      title={mode === 'add' ? 'Add New Goal' : 'Edit Goal'}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave}>
            {mode === 'add' ? 'Add Goal' : 'Save Changes'}
          </Btn>
        </>
      }
    >
      {error && <Alert type="warn">⚠️ {error}</Alert>}
      {!error && weightageWarning && <Alert type="warn">Warning: {weightageWarning}</Alert>}

      <FormGroup label="Thrust Area">
        <Select value={form.thrust} onChange={e => set('thrust', e.target.value)} options={THRUST_AREAS} disabled={goal?.shared} />
      </FormGroup>

      <FormGroup label="Goal Title">
        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Achieve Q2 Sales Target" readOnly={goal?.shared} />
      </FormGroup>

      <FormGroup label="Description">
        <Textarea value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Brief description" rows={2} />
      </FormGroup>

      <div className="form-row">
        <FormGroup label="Unit of Measurement (UoM)">
          <Select value={form.uom} onChange={e => set('uom', e.target.value)} options={UOM_OPTIONS} disabled={goal?.shared} />
        </FormGroup>

        {form.uom === 'Zero' ? (
          <FormGroup label="Target">
            <div className="form-input" style={{ padding: '9px 13px', color: 'var(--text3)', cursor: 'default' }}>0 (auto — zero = success)</div>
          </FormGroup>
        ) : (
          <FormGroup label={form.uom === 'Timeline' ? 'Target Date' : 'Target Value'}>
            <Input
              type={form.uom === 'Timeline' ? 'date' : 'number'}
              value={form.target}
              onChange={e => set('target', e.target.value)}
              placeholder="e.g. 100"
              readOnly={goal?.shared}
            />
          </FormGroup>
        )}
      </div>

      <div className="form-row">
        <FormGroup label="Unit (e.g. Lakhs, %, Days)">
          <Input value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="e.g. Lakhs" />
        </FormGroup>
        <FormGroup label={`Weightage (%) — ${Math.max(100 - usedWeight, 0)}% remaining before submit`}>
          <Input
            type="number" min="10"
            value={form.weightage}
            onChange={e => set('weightage', e.target.value)}
            placeholder="min 10%"
          />
        </FormGroup>
      </div>

      {goal?.shared && (
        <Alert type="info">🔗 This is a shared goal — only weightage can be edited.</Alert>
      )}
    </Modal>
  );
}
