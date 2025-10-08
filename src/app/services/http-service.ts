import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WikipediaService {
    private apiUrl = 'https://en.wikipedia.org/w/api.php'; // Or the REST API endpoint

    private baseUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

    constructor(private http: HttpClient) { }

    searchArticles(searchTerm: string): Observable<any> {
        const params = new HttpParams()
        .set('action', 'query')
        .set('list', 'search')
        .set('srsearch', searchTerm)
        .set('format', 'json')
        .set('origin', '*'); // Required for CORS when using the Action API

        return this.http.get(this.apiUrl, { params });
    }


    getQualifiedTeams(): Observable<any> {
        const title =  '2026_FIFA_World_Cup_qualification';
        const params = new HttpParams()
        .set('action', 'parse')
        .set('page', title)
        .set('prop', 'text')
        .set('format', 'json')
        .set('section', 2)
        .set('origin', '*');
        
        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(response => {
                const html = response?.parse?.text['*'];
                return this.parseTableFromHtml(html);
            }));
    
    }

   
  

    parseTableFromHtml(html: string): any[] {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const table = doc.querySelector('table'); // Adjust selector as needed

        const rows = Array.from(table?.rows ?? []);
        return rows.map(row => {
            return Array.from(row.cells).map(cell => cell.textContent?.trim());
        });
    }
}