import { HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { HttpService } from './http.service';

describe('HttpService', () => {
  let service: HttpService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService]
    });

    service = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET method', () => {
    it('should make a GET request with the correct URL', () => {
      const mockResponse = { data: 'test data' };
      const endpoint = 'test-endpoint';

      service.get(endpoint).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include query parameters when provided', () => {
      const mockResponse = { data: 'test data with params' };
      const endpoint = 'test-endpoint';
      const params = { key1: 'value1', key2: 'value2' };

      service.get(endpoint, params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}?key1=value1&key2=value2`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include headers when provided', () => {
      const mockResponse = { data: 'test data with headers' };
      const endpoint = 'test-endpoint';
      const headers = new HttpHeaders().set('Auth', 'Bearer token');

      service.get(endpoint, {}, headers).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Auth')).toBe('Bearer token');
      req.flush(mockResponse);
    });
  });

  describe('POST method', () => {
    it('should make a POST request with the correct URL and body', () => {
      const mockResponse = { id: '123', success: true };
      const endpoint = 'test-endpoint';
      const body = { name: 'test name', email: 'test@example.com' };

      service.post(endpoint, body).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });

    it('should include headers when provided', () => {
      const mockResponse = { id: '123', success: true };
      const endpoint = 'test-endpoint';
      const body = { name: 'test name' };
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      service.post(endpoint, body, headers).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockResponse);
    });
  });

  describe('PUT method', () => {
    it('should make a PUT request with the correct URL and body', () => {
      const mockResponse = { success: true };
      const endpoint = 'test-endpoint/123';
      const body = { name: 'updated name' };

      service.put(endpoint, body).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });
  });

  describe('PATCH method', () => {
    it('should make a PATCH request with the correct URL and body', () => {
      const mockResponse = { success: true };
      const endpoint = 'test-endpoint/123';
      const body = { status: 'completed' };

      service.patch(endpoint, body).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });
  });

  describe('DELETE method', () => {
    it('should make a DELETE request with the correct URL', () => {
      const mockResponse = { success: true };
      const endpoint = 'test-endpoint/123';

      service.delete(endpoint).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should include headers when provided', () => {
      const mockResponse = { success: true };
      const endpoint = 'test-endpoint/123';
      const headers = new HttpHeaders().set('Authorization', 'Bearer token');

      service.delete(endpoint, headers).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token');
      req.flush(mockResponse);
    });
  });
});