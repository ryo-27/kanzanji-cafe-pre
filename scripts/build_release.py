#!/usr/bin/env python3
"""Build two static publication packages after editing the common source."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'releases'

class HTMLCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, 'Duplicate ID: ' + attrs['id']
            self.ids.add(attrs['id'])
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append(tag)
    def handle_endtag(self, tag):
        assert self.stack and self.stack.pop() == tag, 'Unbalanced HTML: ' + tag

def replace_once(text, old, new):
    assert text.count(old) == 1, 'Expected one source match: ' + old[:90]
    return text.replace(old, new, 1)

def notice(html, title, body, postponed=False):
    block = ('<section id="event-notice" class="event-notice' +
             (' event-notice--postponed' if postponed else '') +
             '" aria-labelledby="event-notice-title"><div class="section-wrap">'
             '<p class="notice-label">開催について</p><h2 id="event-notice-title">' + title +
             '</h2><p>' + body + '</p></div></section>')
    html, count = re.subn(r'<section id="event-notice".*?</section>', lambda _: block, html, flags=re.S)
    assert count == 1
    return html

def generate():
    OUT.mkdir(exist_ok=True)
    source_html = (ROOT / 'index.html').read_text()
    source_js = (ROOT / 'script.js').read_text()
    css = (ROOT / 'styles.css').read_text()
    assets = sorted(set(re.findall(r'assets/[A-Za-z0-9_.~/-]+', source_html + source_js + css)))
    assert assets
    for asset in assets:
        assert (ROOT / asset).is_file(), asset
    for scenario in ('normal', 'sunday-postponed'):
        html, js = source_html, source_js
        html = html.replace('開催判断は11月13日（金）正午に行い、このページでお知らせします。', '最新の開催情報は、このページでお知らせします。')
        if scenario == 'normal':
            title = '11月14日（土）・15日（日）は予定どおり開催します'
            body = '各回の開始15分前に、浜名湖ベイストリート前の会場へお越しください。天候・水面状況により変更がある場合は、このページでお知らせします。'
            html = notice(html, title, body)
            instructions = '通常開催の判断後に使用する版です。開催日：11月14日（土）・15日（日）。'
        else:
            title = '11月15日（日）の開催を11月22日（日）へ延期します'
            body = '11月14日（土）は予定どおり開催します。15日（日）のチケットは、22日（日）の同じ時間帯へ振り替えます。延期に伴いキャンセルを希望される場合は、チケット代金を全額返金します。お問い合わせは本ページ下部のメールからお願いいたします。'
            html = notice(html, title, body, postponed=True)
            replacements = [
                ('2026年11月14日・15日、', '2026年11月14日・22日、'),
                ('<title>Lake Float Cafe in Kanzanji｜湖上で過ごす、特別な体験</title>', '<title>11/15は11/22へ延期｜Lake Float Cafe in Kanzanji</title>'),
                ('<div class="hero-date">', '<div class="hero-date is-split">'),
                ('<span class="date-dash">—</span>15<small>SUN</small>', '<span class="date-dash">／</span>22<small>SUN</small>'),
                ('11月14日・15日の限定開催。', '11月14日・22日の限定開催。'),
                ('<span class="event-day">・15日（日）</span>', '<span class="event-day">・22日（日）</span>'),
                ('<p class="booking-schedule">11月14日（土）・15日（日）', '<p class="booking-schedule">11月14日（土）・22日（日）'),
                ('11.14 SAT — 15 SUN', '11.14 SAT ／ 22 SUN'),
                ('※雨天・強風時は翌週の同じ曜日・時間帯に振替。延期に伴うキャンセルはチケット代金を全額返金します。', '※11/15（日）の回は11/22（日）の同じ時間帯へ延期します。11/14（土）は予定どおり開催します。'),
                ('<dt>予備日</dt><dd>11月21日（土）・22日（日）</dd>', '<dt>振替日</dt><dd>11月22日（日）<span class="fact-detail">11月15日（日）の回を同じ時間帯に振替</span></dd>'),
            ]
            for old, new in replacements:
                html = replace_once(html, old, new)
            html = html.replace('雨天・強風時は翌週の同じ曜日・時間帯へ振り替えます。', '11月15日（日）の回は11月22日（日）の同じ時間帯へ延期します。11月14日（土）は予定どおり開催します。')
            html = html.replace('雨天・強風時は、翌週の同じ曜日・時間帯へ振り替えます。11月14日（土）は21日（土）、15日（日）は22日（日）への振替となります。', '11月15日（日）の回は11月22日（日）の同じ時間帯へ延期します。11月14日（土）は予定どおり開催します。')
            html = html.replace('翌週の同じ曜日・時間帯へ振替<span class="fact-detail">11/14（土）→11/21（土）<br>11/15（日）→11/22（日）', '日曜のみ翌週へ振替<span class="fact-detail">11/14（土）は予定どおり開催<br>11/15（日）→11/22（日）')
            js = replace_once(js, '11/14・15、', '11/14・22、')
            js = js.replace('雨天・強風時は翌週の同じ曜日・時間帯へ振替。', '11/15（日）は11/22（日）の同じ時間帯へ延期。11/14（土）は予定どおり開催。延期に伴うキャンセルはチケット代金を全額返金します。')
            instructions = '11月15日（日）のみ延期する判断後に使用する版です。開催日：11月14日（土）・22日（日）。'
        # A unique immutable URL couples each package's HTML, CSS and JS.
        revision = hashlib.sha256((html + js + css).encode()).hexdigest()[:12]
        html = re.sub(r'(styles\.css|script\.js)\?v=[^"\s]+', lambda m: m[1] + '?v=' + revision, html)
        check = HTMLCheck(); check.feed(html); assert not check.stack
        assert '調整中' not in html
        assert '対応の詳細は決まり次第' not in html
        assert html.count('class="menu-card') == 5
        assert '11月13日（金）正午' not in html, 'Decision-waiting notice in a publication package'
        folder = OUT / scenario
        folder.mkdir(exist_ok=True)
        files = {'index.html': html.encode(), 'script.js': js.encode(), 'styles.css': css.encode()}
        for asset in assets:
            files[asset] = (ROOT / asset).read_bytes()
        guide = instructions + '''

この版は開催判断後にのみ公開してください。ZIPの用意だけでは公開されません。
1. ZIPを展開します。index.html・styles.css・script.js・assets/を、現在の公開元の同名ファイルへ上書きします。
2. GitHub Pages運用では公開元のブランチへcommit/pushし、Actionsのデプロイ成功を確認します。ZIP自体をアップロードしてもWebサイトにはなりません。
3. 上部のお知らせ、開催日、予約欄、モバイル下部、シェア文を公開URLで確認します。キャッシュが残る場合は再読み込みしてください。
4. TicketDiveの開催日・購入済みチケットの振替と返金案内、購入者への連絡は別途主催者側で更新してください。このZIPはTicketDiveを変更しません。
5. 全額返金は延期に伴うキャンセル／主催者都合の中止に対するチケット代金です。

集合：各回15分前、浜名湖ベイストリート前の会場。
開始：9:00／10:30／12:00／13:30、各回1時間制（最終回14:30終了）。
問い合わせメール：kanzanjipj@gmail.com
'''
        files['公開手順.txt'] = guide.encode()
        manifest = {'scenario': scenario, 'revision': revision, 'sha256': {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}}
        files['release-manifest.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode()
        for name, data in files.items():
            dest = folder / name; dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(data)
        archive = OUT / ('lake-float-cafe-' + scenario + '.zip')
        with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
            for name, data in files.items(): z.writestr(name, data)
        with zipfile.ZipFile(archive) as z:
            assert z.testzip() is None
            assert set(z.namelist()) == set(files)
        print(f'{scenario}: {archive} ({archive.stat().st_size:,} bytes), revision={revision}')

if __name__ == '__main__':
    generate()
