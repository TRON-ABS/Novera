"""Validate Spark through an installed Jan's isolated authenticated API.

No real tool is executed: the only tool result is a checked 6*7 calculation.
The private connection file is never copied into the report.
"""
import argparse
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.request


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--secret',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    args=p.parse_args();secret=json.loads(args.secret.read_text())
    base=f"http://127.0.0.1:{secret['port']}/v1"
    result={'checks':[],'model':secret['model'],'configured_context':secret['ctx_size'],
            'limitations':['Configured context allocation is tested; the prompt does not fill 68192 tokens.',
                           'Local synthetic tool calls, no MCP execution or external side effects.',
                           'No UI render, image, MTP or throughput campaign.']}
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def raw(path,body=None):
        return opener.open(urllib.request.Request(base+path,
            data=None if body is None else json.dumps(body,ensure_ascii=False).encode(),
            headers={'Authorization':'Bearer '+secret['key'],'Content-Type':'application/json'}),timeout=180)

    def call(messages,**kwargs):
        body={'model':secret['model'],'messages':messages,'temperature':0,'max_tokens':1024,**kwargs}
        start=time.perf_counter();events=[];done=0;first=None
        with raw('/chat/completions',body) as response:
            if not body.get('stream'):
                answer=json.load(response)
            else:
                content=[];reasoning=[];calls={};usage=None;finish=None;timings=None
                for line in response:
                    if not line.startswith(b'data: '):continue
                    payload=line[6:].strip()
                    if payload==b'[DONE]':done+=1;continue
                    event=json.loads(payload);events.append(event)
                    if event.get('error'):raise RuntimeError(event)
                    usage=event.get('usage') or usage;timings=event.get('timings') or timings
                    for choice in event.get('choices',[]):
                        finish=choice.get('finish_reason') or finish
                        delta=choice.get('delta',{})
                        if (delta.get('content') or delta.get('reasoning_content')) and first is None:first=time.perf_counter()
                        content.append(delta.get('content') or '')
                        reasoning.append(delta.get('reasoning_content') or '')
                        for tc in delta.get('tool_calls',[]):
                            c=calls.setdefault(tc.get('index',0),{'id':'','type':'function','function':{'name':'','arguments':''}})
                            if tc.get('id'):c['id']=tc['id']
                            fun=tc.get('function',{})
                            c['function']['name']+=fun.get('name','')
                            c['function']['arguments']+=fun.get('arguments','')
                assert done==1,('DONE count',done)
                message={'role':'assistant','content':''.join(content),'reasoning_content':''.join(reasoning)}
                if calls:message['tool_calls']=list(calls.values())
                answer={'choices':[{'message':message,'finish_reason':finish}],
                        'usage':usage,'timings':timings,'event_count':len(events),'done_count':done}
            assert answer.get('choices'),answer
            assert answer['choices'][0].get('message') is not None,answer
            return {'response':answer,'total_ms':(time.perf_counter()-start)*1000,
                    'ttft_ms':None if first is None else (first-start)*1000}

    def test(name,fn):
        try:
            details=fn()
            row={'name':name,'passed':True,**details}
        except urllib.error.HTTPError as exc:
            row={'name':name,'passed':False,'http_status':exc.code,'error':exc.read().decode(errors='replace')};exc.close()
        except Exception as exc:
            row={'name':name,'passed':False,'error':repr(exc)}
        result['checks'].append(row)
        args.output.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
        print(json.dumps({'name':name,'passed':row['passed'],'total_ms':row.get('total_ms'),'error':row.get('error')}),flush=True)
        return row

    deadline=time.monotonic()+180
    while True:
        try:
            with raw('/models') as response:models=json.load(response)
            if any(m['id']==secret['model'] for m in models['data']):break
        except Exception:
            if time.monotonic()>deadline:raise
        if time.monotonic()>deadline:raise TimeoutError('Spark not registered')
        time.sleep(.5)

    arithmetic=[{'role':'user','content':'Combien font 2 + 2 ? Réponds uniquement par le résultat.'}]
    def chat(**options):
        row=call(arithmetic,**options);msg=row['response']['choices'][0]['message']
        assert re.search(r'\b4\b',msg.get('content') or ''),msg
        return row
    test('chat-default',lambda:chat())
    off=test('chat-thinking-disabled-request',lambda:chat(chat_template_kwargs={'enable_thinking':False}))
    if off['passed']:
        msg=off['response']['choices'][0]['message']
        off['reasoning_disabled_effective']=not bool(msg.get('reasoning_content')) and '<think>' not in (msg.get('content') or '')

    def stream():
        row=call([{'role':'user','content':'Écris exactement ces caractères, sans commentaire : été 中文 🙂'}],
                 stream=True,stream_options={'include_usage':True},chat_template_kwargs={'enable_thinking':False})
        msg=row['response']['choices'][0]['message'];assert msg.get('content'),msg
        assert '\ufffd' not in msg['content'],msg
        row['exact_text_match']=msg['content'].strip()=='été 中文 🙂'
        assert row['response']['usage'] and row['response']['usage']['completion_tokens']>0
        return row
    test('stream-chat-unicode',stream)

    def structured():
        row=call([{'role':'user','content':'Return a JSON object with answer equal to 42.'}],
            chat_template_kwargs={'enable_thinking':False},response_format={'type':'json_schema','json_schema':{
                'name':'answer','strict':True,'schema':{'type':'object','properties':{'answer':{'type':'integer'}},
                                                      'required':['answer'],'additionalProperties':False}}})
        obj=json.loads(row['response']['choices'][0]['message']['content']);assert obj=={'answer':42},obj
        return row
    test('structured-json-schema',structured)

    tool={'type':'function','function':{'name':'multiply','description':'Multiply two integer values.',
        'parameters':{'type':'object','properties':{'a':{'type':'integer'},'b':{'type':'integer'}},
                      'required':['a','b'],'additionalProperties':False}}}
    messages=[{'role':'user','content':'Use the multiply tool to calculate 6 times 7. Do not calculate it yourself. Call the tool now.'}]
    def tools(stream=False):
        row=call(messages,tools=[tool],tool_choice='auto',stream=stream,
                 stream_options={'include_usage':True},chat_template_kwargs={'enable_thinking':False})
        msg=row['response']['choices'][0]['message'];calls=msg.get('tool_calls') or []
        assert len(calls)==1,msg
        fn=calls[0]['function'];assert fn['name']=='multiply',fn
        params=json.loads(fn['arguments']);assert sorted([params['a'],params['b']])==[6,7],params
        assert calls[0].get('id'),calls
        return row
    selected=test('tool-call-auto',tools)
    test('tool-call-stream',lambda:tools(True))
    if selected['passed']:
        msg=dict(selected['response']['choices'][0]['message']);tc=msg['tool_calls'][0]
        def followup():
            row=call(messages+[msg,{'role':'tool','tool_call_id':tc['id'],'content':'42'}],tools=[tool],
                     chat_template_kwargs={'enable_thinking':False})
            assert re.search(r'\b42\b',row['response']['choices'][0]['message'].get('content') or ''),row
            return row
        test('tool-result-followup',followup)
    else:
        result['checks'].append({'name':'tool-result-followup','passed':False,'skipped':'auto tool call failed'})
    result['status']='complete' if all(x['passed'] for x in result['checks']) else 'limited'
    result['passed']=sum(x['passed'] for x in result['checks']);result['total']=len(result['checks'])
    args.output.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'status':result['status'],'passed':result['passed'],'total':result['total']}))

if __name__=='__main__':main()
